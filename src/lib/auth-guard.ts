import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/**
 * Verifies the caller's session (guest or full account) on the server.
 * Falls back to the build-time public config when the runtime env vars are absent,
 * so AI features keep working in every hosting environment.
 */
export const requireSession = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("The workspace is not connected yet. Try again shortly.");

  const auth = getRequest()?.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) throw new Error("Your session expired. Refresh the page.");

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Your session expired. Refresh the page.");

  return next({ context: { supabase, userId: data.user.id } });
});
