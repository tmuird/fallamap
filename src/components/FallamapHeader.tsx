import { motion } from "framer-motion";

interface FallamapHeaderProps {
 isVisible: boolean;
}

export function FallamapHeader({ isVisible }: FallamapHeaderProps) {
 return (
  <motion.div
   className="w-full pt-[12vh] md:pt-[15vh] pb-8 md:pb-16 flex flex-col items-center justify-center relative"
   initial={{ opacity: 0 }}
   animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
   transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
   <motion.div
    initial={{ y: 10, scale: 0.95 }}
    animate={{ y: 0, scale: 1 }}
    transition={{ type: "spring", damping: 20, stiffness: 100 }}
    className="text-center px-4 mb-4 md:mb-10"
   >
    <h1 className="text-fluid-display font-display text-falla-fire leading-[0.8] tracking-tighter lowercase select-none">
     fallamap
    </h1>
    
    <div className="flex items-center justify-center gap-2 mt-2 md:mt-4">
      <span className="w-1.5 h-1.5 rounded-full bg-falla-sage animate-pulse" />
      <p className="text-[10px] md:text-sm text-falla-ink font-bold uppercase tracking-[0.2em] opacity-40">
        Live from <span className="opacity-100">València</span>
      </p>
    </div>
   </motion.div>

   <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-6">
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="brutal-pill px-3 py-1 md:px-5 md:py-2 bg-falla-paper backdrop-blur-sm border-[1.5px] md:border-2"
    >
     <p className="text-[8px] md:text-xs uppercase tracking-widest text-falla-ink font-black">80 Monuments</p>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="brutal-pill px-3 py-1 md:px-5 md:py-2 bg-falla-paper backdrop-blur-sm border-[1.5px] md:border-2"
    >
     <p className="text-[8px] md:text-xs uppercase tracking-widest text-falla-ink font-black">Official Schedule</p>
    </motion.div>
   </div>
  </motion.div>
 );
}
