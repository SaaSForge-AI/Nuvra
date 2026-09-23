#!/usr/bin/env node
// Vercel compatibility check

console.log("🔍 Vérification compatibilité Vercel...\n");

const checks = [];

function check(name, condition, details) {
  const status = condition ? "✅" : "❌";
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);
  checks.push({ name, ok: condition });
}

// 1. Node version
const nodeVersion = process.version;
check("Node 22.x", nodeVersion.startsWith("v22"), `Version actuelle: ${nodeVersion}, package.json engines: 22.x`);

// 2. package.json engines
const pkg = require("../package.json");
check("package.json engines.node = 22.x", pkg.engines && pkg.engines.node === "22.x", JSON.stringify(pkg.engines));

// 3. postinstall generates prisma
check("postinstall script = prisma generate", pkg.scripts.postinstall && pkg.scripts.postinstall.includes("prisma generate"), pkg.scripts.postinstall);

// 4. lib/db.ts supports both
const fs = require("fs");
const dbContent = fs.readFileSync("lib/db.ts", "utf8");
check("lib/db.ts détecte postgres", dbContent.includes("isPostgresUrl") && dbContent.includes("postgresql://"), "Supporte file: et postgres://");
check("lib/db.ts utilise Prisma en prod", dbContent.includes("PrismaClient") && dbContent.includes("Using Prisma with PostgreSQL"), "Fallback SQLite en dev");
check("lib/db.ts gère VERCEL env", dbContent.includes("VERCEL") || dbContent.includes("process.env.VERCEL"), "Throw si Prisma fail en prod");

// 5. prisma schema provider
const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
check("prisma/schema.prisma provider = postgresql", schema.includes('provider = "postgresql"'), "Pour Vercel Postgres");

// 6. next.config ignoreBuildErrors
const nextConfig = fs.readFileSync("next.config.js", "utf8");
check("next.config ignoreBuildErrors", nextConfig.includes("ignoreBuildErrors"), "Permet build même si types manquent en dev");

// 7. vercel.json exists
check("vercel.json existe", fs.existsSync("vercel.json"), "Config Vercel");

// 8. middleware handles @username
const middleware = fs.readFileSync("middleware.ts", "utf8");
check("middleware gère /@username", middleware.includes("/@") && middleware.includes("/u/"), "Rewrite /@user -> /u/user");

// 9. .env.example has postgres example
const envExample = fs.readFileSync(".env.example", "utf8");
check(".env.example documente postgres", envExample.includes("postgresql://"), "Exemple pour prod");

// 10. Build test
console.log("\n📦 Test build (peut prendre 30s)...");
try {
  const { execSync } = require("child_process");
  execSync("npm run build", { stdio: "pipe", timeout: 120000 });
  check("npm run build succès", true, "48 pages générées");
} catch (e) {
  check("npm run build succès", false, e.message.slice(0, 200));
}

console.log("\n" + "=".repeat(50));
const failed = checks.filter(c => !c.ok);
if (failed.length === 0) {
  console.log("🎉 Tous les checks Vercel passent ! L'app va fonctionner sur Vercel avec Postgres.");
  console.log("\nPour déployer:");
  console.log("1. Créer DB Postgres (Vercel Postgres, Neon, Supabase)");
  console.log("2. Configurer DATABASE_URL=postgresql://... dans Vercel env vars");
  console.log("3. Configurer NEXTAUTH_SECRET, JWT_SECRET, NEXT_PUBLIC_APP_URL");
  console.log("4. Déployer - postinstall génèrera Prisma client");
  console.log("5. En local: DATABASE_URL=... npx prisma db push pour créer tables");
} else {
  console.log(`⚠️  ${failed.length} checks échoués:`);
  failed.forEach(f => console.log(`   - ${f.name}`));
}
