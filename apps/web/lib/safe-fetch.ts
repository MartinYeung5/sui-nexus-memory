"use client";

/**
 * Like fetch().json() but never throws "Unexpected end of JSON input".
 * If the server returned something non-JSON (HTML error page, empty body),
 * the helper returns a synthetic { error, status } object instead.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (e: any) {
    return { ok: false, status: 0, data: null, error: e?.message || "network error" };
  }
  const text = await res.text();
  if (!text) {
    return {
      ok: res.ok,
      status: res.status,
      data: null,
      error: res.ok ? undefined : `HTTP ${res.status} (empty body)`,
    };
  }
  try {
    const data = JSON.parse(text) as any;
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: !res.ok ? data?.error || `HTTP ${res.status}` : undefined,
    };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: `Non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`,
    };
  }
}
