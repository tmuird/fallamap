import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { BOOT_SLOW_MS, bootStatusCopy, describeBootFailure } from "@/lib/bootGuard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/**
 * The outermost guard, rendered in `main.tsx` *outside* ClerkProvider.
 *
 * Without it a Clerk script that cannot be fetched (flaky CDN, ad-blocker, proxy) suspended
 * the root render with no boundary to catch it: `#root` ended up completely empty — a white
 * page with nothing to click, and no console error to explain it. A refresh re-attempted the
 * fetch, which is why refreshing "fixed" it.
 */

function BootFailureCard({ error }: { error: unknown }) {
  const copy = describeBootFailure(error);
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-falla-paper px-6 py-24">
      <div className="w-full max-w-md bg-falla-paper border-2 border-falla-ink rounded-[2rem] shadow-solid p-10 flex flex-col items-center gap-6 text-center">
        <div className="w-14 h-14 bg-falla-fire rounded-full ink-border" />
        <h1 className="font-display text-2xl uppercase tracking-widest text-falla-ink">{copy.title}</h1>
        <p className="text-sm font-bold text-falla-ink/65 leading-relaxed">{copy.body}</p>
        {copy.canRetry && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-falla-fire text-falla-on-fire border-2 border-falla-ink rounded-xl shadow-solid-sm active:scale-95 font-black text-xs uppercase tracking-widest transition-all"
          >
            Reload
          </button>
        )}
      </div>
    </div>
  );
}

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state: { error: unknown } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown) {
    console.error("App failed to start:", error);
  }

  render() {
    if (this.state.error) return <BootFailureCard error={this.state.error} />;
    return this.props.children;
  }
}

/**
 * Fallback for the root Suspense boundary: the branded splash, and past the threshold a way
 * out — a screen that never changes is indistinguishable from a broken one.
 */
function BootFallback() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStuck(true), BOOT_SLOW_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!stuck) return <LoadingScreen />;

  const copy = bootStatusCopy(BOOT_SLOW_MS);
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-falla-paper px-6 py-24" role="status">
      <div className="w-full max-w-md bg-falla-paper border-2 border-falla-ink rounded-[2rem] shadow-solid p-10 flex flex-col items-center gap-6 text-center">
        <div className="w-14 h-14 rounded-full bg-falla-fire/20 border-2 border-falla-fire flex items-center justify-center">
          <div className="w-6 h-6 bg-falla-fire rounded-full animate-pulse" />
        </div>
        <h1 className="font-display text-2xl uppercase tracking-widest text-falla-ink">{copy.title}</h1>
        <p className="text-sm font-bold text-falla-ink/65 leading-relaxed">{copy.body}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-falla-fire text-falla-on-fire border-2 border-falla-ink rounded-xl shadow-solid-sm active:scale-95 font-black text-xs uppercase tracking-widest transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function AppBootGuard({ children }: { children: ReactNode }) {
  return (
    <RootErrorBoundary>
      <Suspense fallback={<BootFallback />}>{children}</Suspense>
    </RootErrorBoundary>
  );
}
