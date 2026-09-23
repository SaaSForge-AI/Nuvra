#!/usr/bin/env node
// End-to-end HTTP QA against a running Nuvra server.
//   BASE_URL=http://localhost:3000 npm run qa
// Works against local SQLite, a local Postgres, or a deployed Vercel URL.
// Every API response is asserted to be JSON: an HTML body is exactly the bug that
// shows up in the browser as "Unexpected token '<'".

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const results = [];
const run = Date.now().toString(36);

function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? "✅" : "❌"} ${name}${!ok && detail ? `\n     ${detail}` : ""}`);
}

class Jar {
  constructor() { this.cookies = new Map(); }
  header() { return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "); }
  store(res) {
    for (const c of res.headers.getSetCookie?.() || []) {
      const [pair, ...attrs] = c.split(";");
      const i = pair.indexOf("=");
      const k = pair.slice(0, i).trim(), v = pair.slice(i + 1).trim();
      const expired = attrs.some((a) => /max-age=0\b/i.test(a.trim())) || v === "";
      if (expired) this.cookies.delete(k); else this.cookies.set(k, v);
    }
  }
}

async function req(method, path, { body, jar, raw } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (jar?.cookies.size) headers.cookie = jar.header();
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  jar?.store(res);
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  let json;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ct, text, json, location: res.headers.get("location") || "" };
}

const isJson = (r) => r.ct.includes("application/json") && r.json !== undefined;
const snippet = (r) => `${r.status} ${r.ct} ${r.text.slice(0, 120)}`;

async function main() {
  console.log(`\n🔎 Nuvra QA → ${BASE}\n`);

  // ── Infrastructure / DB ─────────────────────────────────────────
  const health = await req("GET", "/api/health");
  check("health: répond en JSON", isJson(health), snippet(health));
  check("health: status ok (DB joignable, schéma présent)", health.json?.status === "ok", snippet(health));
  check("health: rendu dynamique (pas figé au build)", health.json?.timestamp && Math.abs(Date.now() - Date.parse(health.json.timestamp)) < 5 * 60_000, snippet(health));
  if (health.json?.db === "postgres") {
    check("health: bootstrap Postgres prêt", health.json?.bootstrap?.state === "ready", JSON.stringify(health.json?.bootstrap));
  }

  // ── Pages publiques ────────────────────────────────────────────
  for (const p of ["/", "/login", "/register"]) {
    const r = await req("GET", p);
    check(`page ${p}: 200`, r.status === 200, snippet(r));
  }

  // ── Login : entrées invalides (toujours JSON, jamais HTML) ─────
  const cases = [
    ["login: body vide → 400 JSON", { raw: "" }, 400],
    ["login: JSON malformé → 400 JSON", { raw: "{not json" }, 400],
    ["login: champs manquants → 400 JSON", { body: { email: "" } }, 400],
    ["login: utilisateur inconnu → 401 JSON", { body: { email: `nobody-${run}@qa.test`, password: "x" } }, 401],
  ];
  for (const [name, opts, code] of cases) {
    const r = await req("POST", "/api/auth/login", opts);
    check(name, r.status === code && isJson(r), snippet(r));
  }

  // ── Inscription ────────────────────────────────────────────────
  const userA = { email: `qa-a-${run}@qa.test`, password: "Secret123!", firstName: "Qa", lastName: "Alpha" };
  const userB = { email: `qa-b-${run}@qa.test`, password: "Secret456!", firstName: "Qa", lastName: "Beta" };
  const jarA = new Jar();
  const regA = await req("POST", "/api/auth/register", { body: userA, jar: jarA });
  check("register A: 200 JSON", regA.status === 200 && isJson(regA) && regA.json.success, snippet(regA));
  check("register A: cookie de session posé", jarA.cookies.has("nuvra_session"));
  const dup = await req("POST", "/api/auth/register", { body: userA });
  check("register: email dupliqué → 400 JSON", dup.status === 400 && isJson(dup), snippet(dup));
  const regBad = await req("POST", "/api/auth/register", { raw: "" });
  check("register: body vide → 400 JSON", regBad.status === 400 && isJson(regBad), snippet(regBad));

  // ── Login / session ────────────────────────────────────────────
  const jarA2 = new Jar();
  const wrong = await req("POST", "/api/auth/login", { body: { email: userA.email, password: "wrong" }, jar: jarA2 });
  check("login A: mauvais mot de passe → 401 JSON", wrong.status === 401 && isJson(wrong), snippet(wrong));
  check("login A: pas de cookie si échec", !jarA2.cookies.has("nuvra_session"));
  const ok = await req("POST", "/api/auth/login", { body: { email: userA.email, password: userA.password }, jar: jarA2 });
  check("login A: 200 JSON", ok.status === 200 && isJson(ok) && ok.json.success === true, snippet(ok));
  check("login A: renvoie onboardingDone", typeof ok.json?.onboardingDone === "boolean", snippet(ok));
  check("login A: cookie de session posé", jarA2.cookies.has("nuvra_session"));
  const okTrim = await req("POST", "/api/auth/login", { body: { email: `  ${userA.email} `, password: userA.password } });
  check("login A: email avec espaces accepté", okTrim.status === 200, snippet(okTrim));

  const me = await req("GET", "/api/me", { jar: jarA2 });
  check("me (A): 200 avec l'utilisateur A", me.status === 200 && me.json?.user?.email === userA.email, snippet(me));
  check("me (A): ne divulgue pas passwordHash", me.json?.user && !("passwordHash" in me.json.user), snippet(me));
  const anon = await req("GET", "/api/me");
  check("me (anonyme): 401 JSON", anon.status === 401 && isJson(anon), snippet(anon));
  const forged = await req("GET", "/api/me", { jar: Object.assign(new Jar(), { cookies: new Map([["nuvra_session", "forged.token.value"]]) }) });
  check("me (token forgé): 401", forged.status === 401, snippet(forged));

  // Onboarding → dashboard
  const dashBefore = await req("GET", "/dashboard", { jar: jarA2 });
  check("dashboard avant onboarding → redirection /onboarding", [302, 303, 307, 308].includes(dashBefore.status) && dashBefore.location.includes("/onboarding"), snippet(dashBefore));
  const onb = await req("POST", "/api/onboarding", { body: { activity: "coach", goal: "sell", usageType: "solo", firstName: "Qa", lastName: "Alpha" }, jar: jarA2 });
  check("onboarding: 200 JSON", onb.status === 200 && isJson(onb), snippet(onb));
  const dash = await req("GET", "/dashboard", { jar: jarA2 });
  check("dashboard après onboarding: 200", dash.status === 200, snippet(dash));
  const dashAnon = await req("GET", "/dashboard");
  check("dashboard anonyme → redirection /login", [302, 303, 307, 308].includes(dashAnon.status) && dashAnon.location.includes("/login"), snippet(dashAnon));

  // ── Isolation entre comptes ────────────────────────────────────
  const jarB = new Jar();
  const regB = await req("POST", "/api/auth/register", { body: userB, jar: jarB });
  check("register B: 200", regB.status === 200, snippet(regB));
  const prodA = await req("POST", "/api/products", { body: { title: `QA product ${run}`, price: 10 }, jar: jarA2 });
  check("A crée un produit", prodA.status === 200 && isJson(prodA) && prodA.json?.id, snippet(prodA));
  const listB = await req("GET", "/api/products", { jar: jarB });
  check("B ne voit pas les produits de A", Array.isArray(listB.json) && !listB.json.some((p) => p.id === prodA.json?.id), snippet(listB));
  const listA = await req("GET", "/api/products", { jar: jarA2 });
  check("A voit son produit", Array.isArray(listA.json) && listA.json.some((p) => p.id === prodA.json?.id), snippet(listA));
  const meB = await req("GET", "/api/me", { jar: jarB });
  check("sessions indépendantes (me B = B)", meB.json?.user?.email === userB.email, snippet(meB));
  const anonProducts = await req("GET", "/api/products");
  check("produits anonyme: 401 JSON", anonProducts.status === 401 && isJson(anonProducts), snippet(anonProducts));

  // ── Logout ─────────────────────────────────────────────────────
  const out = await req("POST", "/api/auth/logout", { jar: jarA2 });
  check("logout: 200 JSON", out.status === 200 && isJson(out), snippet(out));
  check("logout: cookie supprimé", !jarA2.cookies.has("nuvra_session"));
  const meAfter = await req("GET", "/api/me", { jar: jarA2 });
  check("me après logout: 401", meAfter.status === 401, snippet(meAfter));
  const relog = await req("POST", "/api/auth/login", { body: { email: userA.email, password: userA.password } });
  check("re-login après logout: 200", relog.status === 200, snippet(relog));

  // ── Résumé ─────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${failed.length ? "❌" : "✅"} ${results.length - failed.length}/${results.length} checks OK\n`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(`\n❌ QA interrompue: ${e.message}\n   Le serveur tourne-t-il sur ${BASE} ?`);
  process.exit(1);
});
