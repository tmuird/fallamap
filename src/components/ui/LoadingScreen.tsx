"use client";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-falla-paper flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        {/* Custom Brutalist Flame Logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-12 relative"
        >
          <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-solid">
            <path 
              d="M60 135C90 135 110 110 110 80C110 40 85 10 60 5C35 10 10 40 10 80C10 110 30 135 60 135Z" 
              fill="#FF5F1F" 
              stroke="#1A1A1A" 
              strokeWidth="4"
            />
            <path 
              d="M60 115C75 115 85 100 85 85C85 65 70 50 60 45C50 50 35 65 35 85C35 100 45 115 60 115Z" 
              fill="#FFB600" 
              stroke="#1A1A1A" 
              strokeWidth="3"
            />
            <circle cx="55" cy="75" r="4" fill="#1A1A1A" />
            <circle cx="65" cy="75" r="4" fill="#1A1A1A" />
          </svg>
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
        
        <p className="mt-8 font-display text-2xl text-falla-ink tracking-tight uppercase">
          Igniting <span className="text-falla-fire">Falla</span>Map
        </p>
      </div>
    </div>
  );
};
