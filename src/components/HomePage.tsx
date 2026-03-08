import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { ArrowRight, MapTrifold, CalendarBlank, Archive } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

export default function HomePage() {
  return (
    <div className="h-[100dvh] bg-falla-paper flex flex-col items-center relative overflow-hidden">
      {/* Background Sparkles */}
      <div className="w-full absolute inset-0 h-1/2 pointer-events-none">
        <SparklesCore
          id="tsparticleshome"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={40}
          className="w-full h-full"
          particleColor="#FF5F1F"
        />
      </div>
      
      <div className="z-10 w-full flex flex-col items-center h-full px-4">
        <FallamapHeader isVisible={true} />

        <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center -mt-10 md:mt-0 gap-6 md:gap-12">
          {/* Main CTA Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-4 md:gap-8"
          >
            <h2 className="text-3xl md:text-7xl font-display text-falla-ink italic leading-none lowercase tracking-tighter">
              Discover the Magic.
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none justify-center">
              <Link to="/map">
                <Button 
                  size="lg"
                  className="bg-falla-fire text-white h-12 md:h-16 px-8 rounded-full text-xs md:text-lg shadow-solid border-2 border-falla-ink flex items-center gap-3 w-full sm:w-auto"
                >
                  Open Map <ArrowRight size={20} weight="bold" />
                </Button>
              </Link>
              
              <Link to="/schedule" className="sm:hidden">
                <Button 
                  variant="outline"
                  size="lg"
                  className="bg-white text-falla-ink h-12 md:h-16 px-8 rounded-full text-xs md:text-lg shadow-solid border-2 border-falla-ink flex items-center gap-3 w-full"
                >
                  Schedule <CalendarBlank size={20} weight="bold" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Centered Hero Visual - Adjusted for single screen fit */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full h-[25vh] md:h-[45vh] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/60 via-transparent to-transparent opacity-40" />
            <div className="absolute bottom-4 left-6 md:bottom-8 md:left-10 text-white">
              <p className="font-display text-lg md:text-3xl italic tracking-tight lowercase">València, 2026</p>
              <p className="font-sans font-black uppercase tracking-[0.2em] opacity-70 text-[7px] md:text-xs">The world's most flammable stage</p>
            </div>
          </motion.div>

          {/* Quick Links Row (Desktop Only) */}
          <div className="hidden md:flex gap-12 items-center text-falla-ink/30 font-black uppercase text-[10px] tracking-[0.3em]">
            <Link to="/map" className="hover:text-falla-fire transition-colors flex items-center gap-2"><MapTrifold size={16} /> Explore</Link>
            <Link to="/schedule" className="hover:text-falla-fire transition-colors flex items-center gap-2"><CalendarBlank size={16} /> Calendar</Link>
            <Link to="/archive" className="hover:text-falla-fire transition-colors flex items-center gap-2"><Archive size={16} /> History</Link>
          </div>
        </main>

        {/* Floating Mini Footer */}
        <div className="py-6 md:py-10 text-center flex flex-col items-center gap-2">
          <div className="w-1 h-1 bg-falla-fire rounded-full animate-bounce" />
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-falla-ink/20 lowercase">scroll</p>
        </div>
      </div>
    </div>
  );
}
