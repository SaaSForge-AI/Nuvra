import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchJson, postJson } from "../lib/fetch";

function mockFetch(body: string, init: { status?: number; contentType?: string } = {}) {
  const res = new Response(body, {
    status: init.status ?? 200,
    headers: init.contentType ? { "content-type": init.contentType } : {},
  });
  vi.stubGlobal("fetch", vi.fn(async () => res));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("client fetch helpers never surface \"Unexpected token '<'\"", () => {
  it("parses JSON responses", async () => {
    mockFetch(JSON.stringify({ success: true }), { contentType: "application/json" });
    const { data, ok } = await fetchJson("/api/x");
    expect(ok).toBe(true);
    expect(data).toEqual({ success: true });
  });

  it("HTML 500 page -> readable error, not a SyntaxError", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch("<!DOCTYPE html><html><title>500: Internal Server Error</title></html>", {
      status: 500,
      contentType: "text/html; charset=utf-8",
    });
    const err: any = await postJson("/api/auth/login", {}).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(500);
    expect(err.message).not.toMatch(/Unexpected token|JSON/);
  });

  it("HTML 404 -> 'API introuvable'", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch("<!DOCTYPE html>not found", { status: 404, contentType: "text/html" });
    await expect(postJson("/api/nope", {})).rejects.toThrow(/introuvable/);
  });

  it("empty body -> readable error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch("", { status: 504 });
    await expect(postJson("/api/auth/login", {})).rejects.toThrow(/indisponible/);
  });

  it("JSON error body -> uses the API error message", async () => {
    mockFetch(JSON.stringify({ error: "Invalid credentials" }), { status: 401, contentType: "application/json" });
    await expect(postJson("/api/auth/login", {})).rejects.toThrow("Invalid credentials");
  });

  it("network failure -> readable error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    await expect(postJson("/api/auth/login", {})).rejects.toThrow(/joindre le serveur/);
  });
});
