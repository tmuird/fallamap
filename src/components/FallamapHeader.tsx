import { motion } from "framer-motion";

interface FallamapHeaderProps {
 isVisible: boolean;
}

export function FallamapHeader({ isVisible }: FallamapHeaderProps) {
 return (
  <motion.div
   className="w-full pt-12 md:pt-20 pb-8 md:pb-16 flex flex-col items-center justify-center relative"
   initial={{ opacity: 0 }}
   animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
   transition={{ duration: 0.4 }}
  >
   <motion.div
    initial={{ y: 5 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center px-4 mb-6 md:mb-12"
   >
    <h1 className="text-6xl md:text-9xl font-display text-falla-fire leading-none tracking-tight lowercase">
     fallamap
    </h1>
    
    <p className="text-sm md:text-xl text-falla-ink/40 mt-3 md:mt-6 max-w-sm md:max-w-lg mx-auto font-bold tracking-normal leading-tight">
     A friendly, minimalist guide to València's ephemeral heritage.
    </p>
   </motion.div>

   <div className="flex flex-wrap justify-center gap-3 md:gap-6">
    <div className="brutal-pill px-3 py-1 md:px-4 md:py-1.5 border-[1.5px] md:border-2">
     <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-falla-ink font-black">300+ Locations</p>
    </div>
    <div className="brutal-pill px-3 py-1 md:px-4 md:py-1.5 border-[1.5px] md:border-2">
     <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-falla-ink font-black">Live Data</p>
    </div>
   </div>
  </motion.div>
 );
}
