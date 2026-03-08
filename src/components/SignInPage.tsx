import { SignIn } from "@clerk/react";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-falla-paper flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-falla-paper rounded-[2.5rem] ink-border soft-shadow overflow-hidden p-8 border-2 border-falla-ink"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display text-falla-fire italic lowercase mb-2">Welcome Back</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-falla-ink/40">Enter the flame once more</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-falla-fire hover:bg-falla-fire/90 text-sm font-black uppercase tracking-widest h-12 rounded-xl border-2 border-falla-ink shadow-solid active:shadow-none transition-all",
              card: "shadow-none border-none p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-xl border-2 border-falla-ink shadow-solid-sm hover:shadow-none transition-all h-12",
              socialButtonsBlockButtonText: "font-bold text-xs uppercase tracking-widest",
              formFieldInput: "rounded-xl border-2 border-falla-ink/10 focus:border-falla-fire transition-all h-12 px-4",
              footer: "hidden"
            }
          }}
        />
      </motion.div>
    </div>
  );
}
