import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { ArrowRight, MapTrifold, CalendarBlank, Archive, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

export default function HomePage() {
  return (
    <div className="h-[100dvh] bg-[#FAF7F2] flex flex-col items-center relative overflow-hidden selection:bg-falla-fire selection:text-white">
      {/* Subtle "Senyera" / Valencian Flag Gradient Hint at top edge */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-falla-fire via-yellow-400 to-falla-fire opacity-50" />
      
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
      
      {/* Background Sparkles (representing 'Pólvora' / Gunpowder) */}
      <div className="w-full absolute inset-0 h-1/2 pointer-events-none">
        <SparklesCore
          id="tsparticleshome"
          background="transparent"
          minSize={0.8}
          maxSize={2.0}
          particleDensity={30}
          className="w-full h-full opacity-60"
          particleColor="#FF7043"
        />
      </div>
      
      <div className="z-10 w-full flex flex-col items-center h-full px-4 overflow-y-auto scrollbar-hide relative">
        <FallamapHeader isVisible={true} />

        <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center -mt-6 md:mt-0 gap-8 md:gap-14 pb-12">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center gap-6 md:gap-10 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="flex flex-col items-center gap-4"
            >
              <h2 className="text-[2.75rem] leading-[0.85] md:text-8xl font-display text-[#1A1A1A] italic lowercase tracking-tighter max-w-2xl">
                Feel the <span className="text-falla-fire relative inline-block">
                  heat
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-4 text-falla-fire/40 text-2xl"
                  >
                    *
                  </motion.span>
                </span> of the streets.
              </h2>
              
              {/* Cozy Festival Pulse */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full border-2 border-falla-ink/10 shadow-sm mt-2"
              >
                <Sparkle size={14} weight="fill" className="text-falla-fire animate-spin-slow" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-falla-ink/60">
                  <span className="text-falla-fire">La Plantà</span> in progress
                </span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center px-4"
            >
              <Link to="/map" className="flex-1 sm:flex-none">
                <Button 
                  size="lg"
                  className="bg-falla-fire text-white h-14 md:h-18 px-10 rounded-2xl text-sm md:text-xl shadow-solid border-2 border-[#1A1A1A] flex items-center justify-center gap-3 w-full hover:translate-y-[-2px] hover:shadow-solid-lg active:translate-y-0 transition-all group"
                >
                  Enter the Map 
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={22} weight="bold" />
                  </motion.div>
                </Button>
              </Link>
              
              <Link to="/schedule" className="flex-1 sm:flex-none sm:hidden">
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-white text-[#1A1A1A] h-14 px-10 rounded-2xl text-sm shadow-solid border-2 border-[#1A1A1A] flex items-center justify-center gap-3 w-full hover:translate-y-[-2px] hover:shadow-solid-lg active:translate-y-0 transition-all"
                >
                  Schedule <CalendarBlank size={20} weight="bold" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Optimized Hero Image with "Falla" context */}
          <motion.div 
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ delay: 0.3, type: "spring", damping: 20 }}
            className="w-full h-[22vh] md:h-[40vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="absolute bottom-5 left-6 md:bottom-10 md:left-10 text-left">
              <p className="font-display text-2xl md:text-5xl italic tracking-tight lowercase text-white mb-1">Plaça de l'Ajuntament</p>
              <div className="flex items-center gap-2 text-white/80">
                <MapTrifold size={12} weight="bold" />
                <p className="font-sans font-black uppercase tracking-[0.25em] text-[8px] md:text-xs">Falla Municipal 2026</p>
              </div>
            </div>
            
            {/* Subtle "Ninot" badge */}
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Special Section</span>
            </div>
          </motion.div>

          {/* Quick Links Row (Desktop) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden md:flex gap-16 items-center text-[#1A1A1A]/40 font-black uppercase text-[11px] tracking-[0.4em]"
          >
            <Link to="/map" className="hover:text-falla-fire transition-all hover:scale-110 flex items-center gap-2"><MapTrifold size={20} weight="bold" /> Map</Link>
            <div className="w-1 h-1 rounded-full bg-[#1A1A1A]/20" />
            <Link to="/schedule" className="hover:text-falla-fire transition-all hover:scale-110 flex items-center gap-2"><CalendarBlank size={20} weight="bold" /> Program</Link>
            <div className="w-1 h-1 rounded-full bg-[#1A1A1A]/20" />
            <Link to="/archive" className="hover:text-falla-fire transition-all hover:scale-110 flex items-center gap-2"><Archive size={20} weight="bold" /> Archive</Link>
          </motion.div>
        </main>

        {/* Minimal Footer */}
        <div className="py-6 md:py-8 text-center flex flex-col items-center gap-3 shrink-0">
          <p className="text-[8px] font-black uppercase tracking-[0.6em] text-[#1A1A1A]/20 lowercase italic">
            "Deixe'm que et conte..."
          </p>
        </div>
      </div>
    </div>
  );
}
