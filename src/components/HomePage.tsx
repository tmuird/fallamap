import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { ArrowRight, MapTrifold, CalendarBlank, Archive, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

export default function HomePage() {
  return (
    <div className="h-[100dvh] bg-[#FAF7F2] flex flex-col items-center relative overflow-hidden selection:bg-falla-fire selection:text-white">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
      
      {/* Background Sparkles */}
      <div className="w-full absolute inset-0 h-1/2 pointer-events-none">
        <SparklesCore
          id="tsparticleshome"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={30}
          className="w-full h-full"
          particleColor="#FF7043"
        />
      </div>
      
      <div className="z-10 w-full flex flex-col items-center h-full px-4 overflow-y-auto scrollbar-hide">
        <FallamapHeader isVisible={true} />

        <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center -mt-6 md:mt-0 gap-8 md:gap-16 pb-12">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center gap-6 md:gap-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="flex flex-col items-center gap-4"
            >
              <h2 className="text-4xl md:text-8xl font-display text-falla-ink italic leading-[0.85] lowercase tracking-tighter max-w-2xl">
                Discover the <span className="text-falla-fire">Magic</span> of the Streets.
              </h2>
              
              {/* Cozy Festival Pulse */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-4 py-1.5 bg-falla-sand/20 rounded-full border border-falla-ink/5"
              >
                <Sparkle size={14} weight="fill" className="text-falla-fire animate-spin-slow" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-falla-ink/40">March 2026: La Plantà in progress</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none justify-center px-4"
            >
              <Link to="/map" className="flex-1 sm:flex-none">
                <Button 
                  size="lg"
                  className="bg-falla-fire text-white h-14 md:h-18 px-10 rounded-full text-sm md:text-xl shadow-solid border-2 border-falla-ink flex items-center justify-center gap-3 w-full hover:translate-y-[-2px] hover:shadow-solid-lg active:translate-y-0 transition-all"
                >
                  Open Map <ArrowRight size={22} weight="bold" />
                </Button>
              </Link>
              
              <Link to="/schedule" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-white text-falla-ink h-14 md:h-18 px-10 rounded-full text-sm md:text-xl shadow-solid border-2 border-falla-ink flex items-center justify-center gap-3 w-full hover:translate-y-[-2px] hover:shadow-solid-lg active:translate-y-0 transition-all"
                >
                  Schedule <CalendarBlank size={22} weight="bold" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Optimized Hero Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", damping: 20 }}
            className="w-full h-[22vh] md:h-[40vh] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/80 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="absolute bottom-5 left-6 md:bottom-10 md:left-12 text-left">
              <p className="font-display text-xl md:text-4xl italic tracking-tight lowercase text-white">València, 2026</p>
              <p className="font-sans font-black uppercase tracking-[0.25em] opacity-80 text-[8px] md:text-xs text-white">The world's most flammable stage</p>
            </div>
          </motion.div>

          {/* Quick Links Row (Desktop) */}
          <div className="hidden md:flex gap-16 items-center text-falla-ink/30 font-black uppercase text-[10px] tracking-[0.4em]">
            <Link to="/map" className="hover:text-falla-fire transition-all hover:scale-105 flex items-center gap-2 italic"><MapTrifold size={18} weight="bold" /> Explore</Link>
            <Link to="/schedule" className="hover:text-falla-fire transition-all hover:scale-105 flex items-center gap-2 italic"><CalendarBlank size={18} weight="bold" /> Calendar</Link>
            <Link to="/archive" className="hover:text-falla-fire transition-all hover:scale-105 flex items-center gap-2 italic"><Archive size={18} weight="bold" /> History</Link>
          </div>
        </main>

        {/* Minimal Footer */}
        <div className="py-6 md:py-10 text-center flex flex-col items-center gap-3 shrink-0">
          <motion.div 
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 bg-falla-fire rounded-full" 
          />
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-falla-ink/15 lowercase italic">éphemeral heritage</p>
        </div>
      </div>
    </div>
  );
}
