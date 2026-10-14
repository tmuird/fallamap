import { AuthenticateWithRedirectCallback } from "@clerk/react";

/**
 * Landing route for Clerk's OAuth redirects (`/sso-callback`). Clerk finishes the
 * handshake here and forwards to the URL we asked for.
 */
export default function SsoCallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-falla-fire-ink">
        Finishing sign-in
      </p>
      <p className="text-sm font-semibold text-falla-ink/65" role="status">
        One moment while we complete the handshake…
      </p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
