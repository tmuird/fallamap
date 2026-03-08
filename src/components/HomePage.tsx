import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { ArrowRight, MapTrifold, CalendarBlank, Archive, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-falla-paper flex flex-col items-center relative overflow-x-hidden selection:bg-falla-fire selection:text-white pb-20">
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
      
      <div className="z-10 w-full flex flex-col items-center px-4 relative">
        <FallamapHeader isVisible={true} />

        <main className="w-full max-w-6xl flex flex-col items-center justify-center -mt-[2vh] md:mt-0 gap-[4vh] md:gap-[6vh] pb-12">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center gap-[2vh] md:gap-[4vh] w-full">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="flex flex-col items-center gap-2"
            >
              <h2 className="text-fluid-xl md:text-fluid-2xl font-display text-falla-ink italic lowercase tracking-tighter max-w-2xl leading-[0.9]">
                Feel the <span className="text-falla-fire relative inline-block">
                  heat
                  <motion.span 
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-[1vh] -right-[2vw] text-falla-fire/40 text-[2rem] md:text-[4rem]"
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
                className="flex items-center gap-2 px-4 py-1.5 bg-falla-paper/80 backdrop-blur-md rounded-full border-2 border-falla-ink/10 shadow-sm mt-1 text-falla-ink"
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
              className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px] sm:max-w-none justify-center px-4"
            >
              <Link to="/map" className="flex-1 sm:flex-none">
                <Button 
                  size="lg"
                  className="bg-falla-fire text-falla-paper h-12 md:h-14 px-8 md:px-10 rounded-full text-sm md:text-base shadow-solid border-2 border-falla-ink flex items-center justify-center gap-2 w-full hover:translate-y-[-2px] hover:shadow-solid-lg hover:rotate-1 active:translate-y-0 transition-all group font-black uppercase tracking-widest"
                >
                  Explore Map 
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} weight="bold" />
                  </motion.div>
                </Button>
              </Link>
              
              <Link to="/schedule" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-falla-paper text-falla-ink h-12 md:h-14 px-8 rounded-full text-sm md:text-base shadow-solid border-2 border-falla-ink flex items-center justify-center gap-2 w-full hover:translate-y-[-2px] hover:shadow-solid-lg hover:-rotate-1 active:translate-y-0 transition-all font-black uppercase tracking-widest"
                >
                  Schedule <CalendarBlank size={20} weight="bold" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Optimized Hero Image - Proportional Height */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 20 }}
            className="w-full h-[22vh] md:h-[35vh] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group max-w-4xl mx-auto shrink-0 mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="absolute bottom-[2vh] left-[2vw] md:bottom-8 md:left-8 text-left">
              <p className="font-display text-fluid-lg md:text-fluid-xl italic tracking-tight lowercase text-white mb-1">Plaça de l'Ajuntament</p>
              <div className="flex items-center gap-2 text-white/80">
                <MapTrifold size={16} weight="bold" />
                <p className="font-sans font-black uppercase tracking-[0.25em] text-[8px] md:text-xs">Falla Municipal 2026</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Links Row (Desktop) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden md:flex gap-12 items-center text-falla-ink/40 font-black uppercase text-[11px] tracking-[0.4em]"
          >
            <Link to="/map" className="hover:text-falla-fire transition-all hover:scale-110 flex items-center gap-2 italic"><MapTrifold size={20} weight="bold" /> Map</Link>
            <div className="w-1 h-1 rounded-full bg-falla-ink/20" />
            <Link to="/schedule" className="hover:text-falla-fire transition-all hover:scale-110 flex items-center gap-2 italic"><CalendarBlank size={20} weight="bold" /> Program</Link>
            <div className="w-1 h-1 rounded-full bg-falla-ink/20" />
            <Link to="/archive" className="hover:text-falla-fire transition-all hover:scale-110 flex items-center gap-2 italic"><Archive size={20} weight="bold" /> Archive</Link>
          </motion.div>
        </main>

        {/* Minimal Footer */}
        <div className="pb-6 text-center flex flex-col items-center gap-2 shrink-0">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.6em] text-falla-ink/20 lowercase italic">
            "Deixe'm que et conte..."
          </p>
        </div>
      </div>
    </div>
  );
}
