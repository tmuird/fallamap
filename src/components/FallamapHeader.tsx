import { motion } from "framer-motion";

interface FallamapHeaderProps {
  isVisible: boolean;
}

export function FallamapHeader({ isVisible }: FallamapHeaderProps) {
  return (
    <motion.div
      className="w-full pt-16 pb-12 flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center px-4"
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-falla-ink uppercase leading-[0.8]">
          FALLA<span className="text-falla-fire">MAP</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-falla-ink/70 mt-6 max-w-lg mx-auto font-bold tracking-tight">
          A playful guide to Valencia's street art heritage.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <div className="bg-falla-paper px-5 py-2.5 rounded-2xl ink-border soft-shadow">
          <p className="text-xs uppercase tracking-[0.2em] text-falla-ink font-bold">300+ Locations</p>
        </div>
        <div className="bg-falla-paper px-5 py-2.5 rounded-2xl ink-border soft-shadow">
          <p className="text-xs uppercase tracking-[0.2em] text-falla-ink font-bold">Live Updates</p>
        </div>
      </div>
    </motion.div>
  );
}
