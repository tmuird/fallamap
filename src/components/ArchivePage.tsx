import { motion } from "framer-motion";
import { Clock, BookOpen, Camera, Database } from "@phosphor-icons/react";

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-falla-paper pt-32 md:pt-48 pb-24 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="brutal-pill inline-block mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire flex items-center gap-2">
              <BookOpen size={14} weight="bold" /> Heritage Archive
            </span>
          </div>
          
          <h1 className="text-6xl md:text-[10rem] font-display text-falla-ink mb-8 leading-[0.85] lowercase">
            coming <span className="text-falla-fire">soon</span>
          </h1>
          
          <div className="flex flex-col items-center gap-10">
            <div className="w-24 h-24 rounded-[2.5rem] bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20 animate-pulse soft-shadow-sm">
              <Clock size={48} weight="fill" />
            </div>
            
            <p className="text-falla-ink font-medium text-xl md:text-3xl max-w-2xl mx-auto leading-tight opacity-60">
              We're currently documenting the <span className="text-falla-fire font-black opacity-100">2026 festival</span>. Previous years will be restored to the digital heritage map after the final Cremà.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "3D Scanning", icon: <Camera size={32} weight="bold" />, desc: "Photogrammetry of every monument." },
            { title: "Historical Data", icon: <Database size={32} weight="bold" />, desc: "Records dating back to 1940." },
            { title: "Legacy Photos", icon: <BookOpen size={32} weight="bold" />, desc: "Community memories preserved." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 ink-border rounded-[2.5rem] border-dashed border-2 flex flex-col items-center text-center gap-6 bg-falla-paper group hover:bg-falla-sand/20 hover:border-solid transition-all cursor-default border-falla-ink/20"
            >
              <div className="text-falla-ink/20 group-hover:text-falla-fire transition-colors">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-falla-ink mb-2">{item.title}</h3>
                <p className="text-sm font-medium text-falla-ink/40">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-24 text-center">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] text-falla-ink/10 italic">
            "Deixe'm que et conte..."
          </p>
        </div>
      </div>
    </div>
  );
}
