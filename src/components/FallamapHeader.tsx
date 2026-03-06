import { motion } from "framer-motion";

interface FallamapHeaderProps {
 isVisible: boolean;
}

export function FallamapHeader({ isVisible }: FallamapHeaderProps) {
 return (
  <motion.div
   className="w-full pt-20 pb-16 flex flex-col items-center justify-center relative"
   initial={{ opacity: 0 }}
   animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
   transition={{ duration: 0.4 }}
  >
   <motion.div
    initial={{ y: 5 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center px-4 mb-12"
   >
    <h1 className="text-7xl md:text-9xl font-display text-falla-fire leading-none tracking-normal">
     FallaMap
    </h1>
    
    <p className="text-lg md:text-xl text-falla-ink/50 mt-6 max-w-lg mx-auto font-bold tracking-normal">
     A friendly, minimalist guide to València's ephemeral heritage.
    </p>
   </motion.div>

   <div className="flex flex-wrap justify-center gap-6">
    <div className="brutal-pill">
     <p className="text-[10px] uppercase tracking-[0.2em] text-falla-ink font-black">300+ Locations</p>
    </div>
    <div className="brutal-pill">
     <p className="text-[10px] uppercase tracking-[0.2em] text-falla-ink font-black">Live Data</p>
    </div>
   </div>
  </motion.div>
 );
}
