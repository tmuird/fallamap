import { motion } from "framer-motion";
import { Clock } from "@phosphor-icons/react";

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-falla-paper pt-32 pb-24 px-4 md:px-8 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="brutal-pill inline-block bg-falla-paper border-falla-ink/20 shadow-none px-6 py-2">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-falla-fire">legacy archive</span>
          </div>
          
          <h1 className="text-6xl md:text-[10rem] font-display text-falla-ink mb-6 leading-none italic tracking-tighter lowercase">
            coming soon
          </h1>
          
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20 animate-pulse">
              <Clock size={40} weight="fill" />
            </div>
            
            <p className="text-falla-ink font-medium text-lg md:text-2xl max-w-lg mx-auto leading-tight opacity-60">
              We're currently documenting the <span className="text-falla-fire font-black opacity-100">2026 festival</span>. Previous years will be restored to the digital heritage map after the final Cremà.
            </p>
          </div>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-falla-ink font-black uppercase text-[10px] tracking-[0.3em] opacity-20">
            <div className="p-6 ink-border rounded-[2rem] border-dashed border-2">3D Scanning</div>
            <div className="p-6 ink-border rounded-[2rem] border-dashed border-2">Historical Data</div>
            <div className="p-6 ink-border rounded-[2rem] border-dashed border-2">Legacy Photos</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
