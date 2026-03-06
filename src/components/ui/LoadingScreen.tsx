"use client";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-falla-paper flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        {/* Flamenco Dancer Placeholder - You can replace this with your AI generated SVG */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-8xl mb-8 select-none drop-shadow-[0_0_30px_rgba(255,95,31,0.5)]"
        >
          🔥
        </motion.div>

        {/* Loading Bar */}
        <div className="w-48 h-3 bg-falla-ink/10 rounded-full overflow-hidden ink-border relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-full bg-falla-fire"
          />
        </div>
        
        <p className="mt-6 font-display text-xl text-falla-fire animate-pulse uppercase tracking-widest">
          Igniting Fallamap...
        </p>
      </div>
    </div>
  );
};
