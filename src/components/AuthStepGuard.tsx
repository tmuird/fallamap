import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowsClockwise } from "@phosphor-icons/react";
import {
  AUTH_STEP_RENDER_GRACE_MS,
  CLERK_STEP_SELECTOR,
  isAuthSubroute,
  shouldOfferAuthStepRecovery,
} from "@/lib/authStep";

interface AuthStepGuardProps {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
}

/**
 * Renders a branded recovery panel when a Clerk subroute produces no step.
 *
 * Hooked into the sign-in/sign-up pages so a stale verification link, a bookmarked
 * step URL or a return from the browser's back button shows users where they are and
 * how to continue, instead of a heading over an empty form area.
 */
export default function AuthStepGuard({ mode, children }: AuthStepGuardProps) {
  const location = useLocation();
  const [needsRecovery, setNeedsRecovery] = useState(false);

  useEffect(() => {
    setNeedsRecovery(false);
    if (!isAuthSubroute(location.pathname)) return;

    const timer = window.setTimeout(() => {
      const hasRenderedStep = Boolean(document.querySelector(CLERK_STEP_SELECTOR));
      setNeedsRecovery(shouldOfferAuthStepRecovery(true, hasRenderedStep));
    }, AUTH_STEP_RENDER_GRACE_MS);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (!needsRecovery) return <>{children}</>;

  const isSignUp = mode === "sign-up";

  return (
    <div
      role="status"
      className="rounded-2xl border-2 border-dashed border-falla-ink/20 bg-falla-sand/10 p-6"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-fire">
        Step unavailable
      </p>
      <h3 className="mt-3 text-xl font-display lowercase text-falla-ink">
        This step has expired
      </h3>
      <p className="mt-2 text-sm font-medium leading-relaxed text-falla-ink/55">
        Verification and reset links only work while the step is active in this browser.
        Start again to get a fresh one.
      </p>
      <div className="mt-5">
        <Link
          to={isSignUp ? "/sign-up" : "/sign-in"}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-falla-ink bg-falla-fire px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-solid transition-all hover:shadow-none"
        >
          <ArrowsClockwise size={16} weight="bold" aria-hidden="true" />
          {isSignUp ? "Create your account" : "Sign in again"}
        </Link>
      </div>
    </div>
  );
}
