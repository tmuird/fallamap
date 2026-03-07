import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

export default function HomePage() {
  return (
    <div className="h-screen bg-falla-paper flex flex-col items-center relative overflow-hidden">
      <div className="w-full absolute inset-0 h-1/2 pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#FF5F1F"
        />
      </div>
      
      <div className="z-10 w-full flex flex-col items-center h-full">
        <FallamapHeader isVisible={true} />

        <main className="w-full max-w-[1400px] px-4 md:px-8 flex-1 flex flex-col items-center justify-start md:justify-center -mt-4 md:mt-0">
          <div className="w-full flex flex-col gap-4 md:gap-10 items-center">
            {/* CTA Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center max-w-2xl px-2"
            >
              <h2 className="text-3xl md:text-7xl font-display text-falla-ink italic mb-3 md:mb-8 leading-tight">
                Discover the Magic.
              </h2>
              <Button 
                size="lg"
                className="bg-falla-fire text-white h-12 md:h-16 px-8 md:px-12 rounded-full text-sm md:text-lg shadow-solid hover:translate-y-[-2px] active:translate-y-0 transition-all border-2 border-falla-ink"
              >
                <Link to="/map" className="flex items-center gap-3">
                  Open Map <ArrowRight size={18} weight="bold" />
                </Link>
              </Button>
            </motion.div>

            {/* Compact Hero Image */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-[30vh] md:h-[50vh] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group max-w-4xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-6 md:bottom-10 md:left-10 text-white">
                <p className="font-display text-lg md:text-3xl italic drop-shadow-md tracking-normal">València, 2026</p>
                <p className="font-sans font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-80 text-[7px] md:text-xs text-white">The world's most flammable stage</p>
              </div>
            </motion.div>
          </div>
        </main>

        <div className="pb-6 md:pb-12 text-center shrink-0">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-falla-ink/20 lowercase">scroll</p>
        </div>
      </div>
    </div>
  );
}
