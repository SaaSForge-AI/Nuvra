/**
 * fetch + JSON parsing that never surfaces "Unexpected token '<'".
 *
 * Only parses the body as JSON when the server says it is JSON; otherwise (HTML
 * error page from Next.js/Vercel, empty body, proxy error...) it throws an Error
 * with a human-readable, status-based message.
 */
export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function describeStatus(status: number, url: string) {
  if (status === 404) return `API introuvable (${url}).`;
  if (status === 502 || status === 503 || status === 504)
    return "Service momentanément indisponible (base de données ?). Réessaie dans un instant.";
  if (status >= 500) return `Erreur serveur (${status}). Consulte les logs du déploiement.`;
  return `Réponse inattendue du serveur (${status}).`;
}

export async function fetchJson<T = any>(url: string, opts?: RequestInit): Promise<{ res: Response; data: T; ok: boolean }> {
  let res: Response;
  try {
    res = await fetch(url, opts);
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifie ta connexion.", 0);
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  let data: any = undefined;
  if (contentType.includes("application/json") && text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
  }

  if (data === undefined) {
    console.error(`Non-JSON response from ${url} (${res.status}):`, text.slice(0, 200));
    throw new ApiError(describeStatus(res.status, url), res.status);
  }
  return { res, data: data as T, ok: res.ok };
}

/** Like fetchJson but also throws on non-2xx, using the API's `error` field. */
export async function postJson<T = any>(url: string, body: unknown, fallbackError = "La requête a échoué"): Promise<T> {
  const { res, data, ok } = await fetchJson<any>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!ok) throw new ApiError(data?.error || fallbackError, res.status, data);
  return data as T;
}
