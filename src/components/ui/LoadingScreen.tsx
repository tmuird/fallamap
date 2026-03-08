"use client";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-falla-paper flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        {/* Custom Brutalist Flame Logo */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-12 relative"
        >
          <svg width="100" height="120" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M60 135C90 135 110 110 110 80C110 40 85 10 60 5C35 10 10 40 10 80C10 110 30 135 60 135Z" 
              fill="#FF7043" 
              stroke="#1A1A1A" 
              strokeWidth="6"
            />
            <path 
              d="M60 115C75 115 85 100 85 85C85 65 70 50 60 45C50 50 35 65 35 85C35 100 45 115 60 115Z" 
              fill="#FFB600" 
              stroke="#1A1A1A" 
              strokeWidth="4"
            />
          </svg>
        </motion.div>

        {/* Faster Loading Bar */}
        <div className="w-40 h-2 bg-falla-ink/5 rounded-full overflow-hidden ink-border relative border-[1.5px]">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 1.2,
              ease: "circOut",
            }}
            className="h-full bg-falla-fire"
          />
        </div>
        
        <p className="mt-6 font-display text-lg text-falla-ink tracking-tight uppercase lowercase opacity-40">
          igniting <span className="text-falla-fire">falla</span>map
        </p>
      </div>
    </div>
  );
};
