import { useEffect } from "react";
import { useSession } from "@clerk/react";
import { registerClerkTokenGetter } from "@/lib/supabase";

/**
 * Registers Clerk's session-token getter with the shared Supabase client so
 * every Supabase request carries the Clerk session token (third-party auth).
 * Render exactly once, as a child of <ClerkProvider>. Signed out → requests
 * fall back to the anon key. See docs/supabase-clerk-auth.md.
 */
export function SupabaseAuthBridge() {
  const { session } = useSession();

  useEffect(() => {
    if (!session) {
      registerClerkTokenGetter(null);
      return;
    }
    registerClerkTokenGetter(async () => (await session.getToken()) ?? null);
    return () => registerClerkTokenGetter(null);
  }, [session]);

  return null;
}
