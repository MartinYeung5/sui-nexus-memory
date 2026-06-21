import { NextResponse } from "next/server";

/**
 * Wrap an async route handler so it ALWAYS returns JSON, even on uncaught errors.
 * This prevents the dreaded "Unexpected end of JSON input" on the client.
 */
export function withJsonErrorHandling<Args extends any[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (e: any) {
      const msg = e?.message || String(e);
      const code = e?.code || e?.name || "INTERNAL_ERROR";
      console.error("[api] uncaught:", code, msg, e?.stack);
      return NextResponse.json(
        { error: msg, code, ok: false },
        { status: 500 }
      );
    }
  };
}

/** Assert that all listed env vars exist; throw a friendly error otherwise. */
export function requireEnv(...names: string[]) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Set them in apps/web/.env.local and restart the dev server.`
    );
  }
}
