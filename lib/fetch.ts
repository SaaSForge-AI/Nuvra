export async function fetchJson(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { res, data, ok: res.ok };
  } catch {
    // If response is HTML (<!DOCTYPE) we got a server error or 404
    console.error(`Non-JSON response from ${url}:`, text.slice(0, 200));
    throw new Error(
      res.status === 404
        ? `API not found: ${url}`
        : res.status >= 500
        ? `Server error (${res.status}). Vérifie DATABASE_URL sur Vercel ou les logs.`
        : `Unexpected response: ${text.slice(0, 100)}`
    );
  }
}
