import { ArrowUpRight, Sparkle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SITE } from "@/lib/siteConfig";

type AuthMode = "sign-in" | "sign-up";

interface AuthPageShellProps {
  mode: AuthMode;
  children: React.ReactNode;
}

export default function AuthPageShell({ mode, children }: AuthPageShellProps) {
  const isSignIn = mode === "sign-in";

  return (
    <section className="w-full flex-1 flex items-center justify-center px-4 pt-20 pb-16 md:pt-[148px] md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="grid w-full min-w-0 max-w-5xl overflow-hidden rounded-[2rem] border-2 border-falla-ink bg-falla-paper shadow-solid md:grid-cols-[0.9fr_1.1fr]"
      >
        {/* Both grid children need `min-w-0`: a grid item defaults to min-width:auto, so
            Clerk's card (min-content ≈350px) used to force this column wider than a
            390px viewport and the form was clipped instead of reflowing. */}
        <aside className="relative flex min-w-0 flex-col justify-between overflow-hidden bg-falla-ink p-6 text-falla-paper sm:p-10 md:min-h-[38rem] md:p-12">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-falla-paper/65">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-falla-paper/25 text-falla-fire">
              <Sparkle size={16} weight="fill" />
            </span>
            {SITE.brand.name}
          </div>
          <div className="relative z-10 mt-6 md:mt-0">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-falla-fire md:mb-4">
              Your event community
            </p>
            <h1 className="max-w-sm text-3xl font-display leading-[0.95] text-falla-paper sm:text-5xl md:leading-[0.92] lowercase">
              Your event, <span className="text-falla-fire">all in one place.</span>
            </h1>
            <p className="mt-4 hidden max-w-sm text-sm font-medium leading-relaxed text-falla-paper/65 sm:block md:mt-5">
              Follow the schedule, explore the map and keep your event plans close.
            </p>
          </div>
          <p className="mt-8 hidden text-[10px] font-black uppercase tracking-[0.18em] text-falla-paper/35 md:block">
            {isSignIn ? "Good to see you again." : "Make this event yours."}
          </p>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 hidden h-44 w-44 rounded-full border-[24px] border-falla-fire/10 md:block" />
        </aside>

        <div className="flex min-w-0 items-center px-5 py-7 sm:px-10 md:px-12 md:py-12">
          <div className="mx-auto w-full max-w-md">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-falla-fire">
              {isSignIn ? "Your account" : "Get started"}
            </p>
            <h2 className="mb-2 text-2xl font-display lowercase text-falla-ink sm:text-4xl">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mb-6 text-sm font-medium text-falla-ink/50">
              {isSignIn ? "Sign in to continue your journey." : "A few details, then you’re in."}
            </p>

            {children}

            <div className="mt-7 flex flex-wrap items-center gap-x-2 border-t border-falla-ink/10 pt-5 text-sm font-semibold text-falla-ink/55">
              <span>{isSignIn ? "New here?" : "Already have an account?"}</span>
              <Link
                to={isSignIn ? "/sign-up" : "/sign-in"}
                className="inline-flex items-center gap-1 font-black text-falla-fire underline decoration-falla-fire/30 underline-offset-4 hover:decoration-falla-fire focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-falla-fire"
              >
                {isSignIn ? "Create an account" : "Sign in"}
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
