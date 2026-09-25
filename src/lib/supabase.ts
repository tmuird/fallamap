import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
 console.warn("Missing Supabase configuration. Check your .env file.");
}

/**
 * Clerk↔Supabase third-party auth (see docs/supabase-clerk-auth.md).
 *
 * supabase-js calls `accessToken` before every request. Returning the Clerk
 * session token authenticates the request as that Clerk user — Supabase maps
 * the token's `sub` claim to auth.jwt()->>'sub', which the RLS policies in
 * scripts/schema.sql are keyed on. Returning null falls back to the anon key
 * (the signed-out path; supabase-js substitutes the configured key itself).
 *
 * The token getter is registered by <SupabaseAuthBridge /> (mounted inside
 * ClerkProvider); until it mounts — and whenever there is no Clerk session —
 * requests run unauthenticated, exactly like the pre-auth-wiring behaviour.
 */
type TokenGetter = () => Promise<string | null>;

let clerkTokenGetter: TokenGetter | null = null;

/** Register (or clear, with null) the Clerk session-token getter. */
export function registerClerkTokenGetter(getter: TokenGetter | null): void {
 clerkTokenGetter = getter;
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
 accessToken: async () => {
  if (!clerkTokenGetter) return null;
  try {
   return (await clerkTokenGetter()) ?? null;
  } catch {
   // Token fetch failure: send the request unauthenticated rather than
   // aborting it — public reads stay available through the anon policies.
   return null;
  }
 },
});
