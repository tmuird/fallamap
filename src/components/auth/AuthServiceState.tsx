import { useEffect, useState } from "react";
import { BOOT_SLOW_MS, bootStatusCopy } from "@/lib/bootGuard";

/**
 * The state of an auth form while Clerk's client has not reported ready.
 *
 * This used to be an unconditional skeleton: if Clerk's script could not be fetched (blocked
 * by an ad-blocker or a proxy, or the CDN simply not answering) the sign-in page showed three
 * grey bars where the fields should be, with no inputs, no buttons and no explanation — it
 * read as a blank page, and it never recovered until the user refreshed. Past the threshold
 * it now says what is happening and offers a retry.
 */
export function AuthServiceLoading() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStuck(true), BOOT_SLOW_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!stuck) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading sign-in form">
        <div className="h-12 w-full animate-pulse rounded-xl bg-falla-ink/5" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-falla-ink/5" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-falla-ink/5" />
      </div>
    );
  }

  const copy = bootStatusCopy(BOOT_SLOW_MS);

  return (
    <div className="space-y-4 rounded-2xl border-2 border-falla-ink/10 bg-falla-sand/20 p-5" role="status">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-fire-ink">{copy.title}</p>
      <p className="text-sm font-medium leading-relaxed text-falla-ink/65">{copy.body}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="w-full rounded-xl border-2 border-falla-ink bg-falla-fire px-5 py-3 text-xs font-black uppercase tracking-widest text-falla-on-fire shadow-solid-sm transition-all active:scale-95"
      >
        Reload
      </button>
    </div>
  );
}
