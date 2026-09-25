import { useUser } from "@clerk/react";
import { PassportView } from "./PassportView";
import { CollectionView } from "./CollectionView";
import { ActivityView } from "./ActivityView";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Fingerprint } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const { user, isLoaded, isSignedIn } = useUser();
  // Clerk reports `isSignedIn: undefined` until the client finishes loading —
  // treat "loaded and signed in with a user object" as the only signed-in state
  // so the hero never flashes the signed-out CTA at real users.
  const signedIn = isLoaded === true && isSignedIn === true && !!user;

  return (
    <div className="min-h-screen bg-falla-paper pt-32 md:pt-48 pb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-20"
        >
          {/* Never render <img> without a real source — signed-out visitors used
              to get a broken avatar here (T2.2). */}
          {signedIn && user?.imageUrl ? (
            <div className="w-24 h-24 rounded-full overflow-hidden ink-border shadow-solid mb-6 border-4">
              <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-falla-paper ink-border shadow-solid mb-6 border-4">
              {isLoaded ? (
                <Fingerprint size={40} weight="bold" className="text-falla-fire" />
              ) : (
                <div className="w-full h-full bg-falla-ink/10 animate-pulse" aria-hidden="true" />
              )}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-display mb-2 text-falla-ink">
            {signedIn ? (
              <>Bon dia, <span className="text-falla-fire">{user?.firstName || "Faller"}</span></>
            ) : isLoaded ? (
              <>Your <span className="text-falla-fire">journey</span></>
            ) : (
              <span className="inline-block h-12 w-64 max-w-full rounded-full bg-falla-ink/10 animate-pulse" aria-hidden="true" />
            )}
          </h1>
          <p className="text-falla-ink font-bold uppercase tracking-[0.2em] text-xs opacity-40">
            València's Street Art Scout
          </p>

          {!isLoaded ? null : !signedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 w-full max-w-md bg-falla-paper/60 ink-border rounded-3xl border-2 border-falla-ink/10 p-6"
            >
              <p className="text-sm font-bold text-falla-ink/60 mb-5">
                Sign in to sync stamps, favourites and photos across devices.
                Everything you mark here stays saved on this device meanwhile.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/sign-in">
                  <Button size="sm" className="h-11 px-8 rounded-xl ink-border shadow-solid hover:shadow-none transition-all font-black uppercase tracking-widest text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button variant="neutral" size="sm" className="h-11 px-8 rounded-xl ink-border shadow-solid hover:shadow-none transition-all font-black uppercase tracking-widest text-xs">
                    Create Account
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : null}
        </motion.div>

        <PassportView />
        <CollectionView />
        <ActivityView />
      </div>
    </div>
  );
}
