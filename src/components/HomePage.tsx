import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ArrowRight, Flame, Camera, ChatCircleDots, MapTrifold } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-falla-paper flex flex-col items-center">
      <FallamapHeader isVisible={true} />

      <main className="w-full max-w-[1400px] px-4 md:px-8 pb-32 flex flex-col items-center">
        {/* Launch Map Hero Section - Refined for "Above the Fold" visibility */}
        <div className="w-full flex flex-col gap-10 mb-32 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center max-w-2xl px-4"
          >
            <h2 className="text-4xl md:text-6xl font-display text-falla-ink italic mb-8 leading-tight">
              Explore the city.
            </h2>
            <Button 
              className="bg-falla-fire text-white h-14 px-10 rounded-full text-base shadow-solid hover:translate-y-[-2px] active:translate-y-0 transition-all border-2 border-falla-ink"
            >
              <Link to="/map" className="flex items-center gap-3">
                Open Interactive Map <ArrowRight size={20} weight="bold" />
              </Link>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full h-[40vh] md:h-[55vh] rounded-[3rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/40 to-transparent" />
          </motion.div>
        </div>
        
        <div className="w-full">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="brutal-pill mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">The Platform</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display text-falla-ink italic">Everything you need for <span className="text-falla-fire">Fallas</span></h2>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            <BentoGridItem
              title="Live Discovery"
              description="Navigate Valencia's ephemeral landscape with real-time tracking of every major monument and neighborhood ninot."
              header={<div className="h-32 w-full bg-falla-fire/5 rounded-3xl flex items-center justify-center border-2 border-falla-fire/10"><MapTrifold size={48} weight="thin" className="text-falla-fire/40" /></div>}
              icon={<Flame size={24} weight="bold" className="text-falla-fire" />}
              className="md:col-span-2"
            />
            <BentoGridItem
              title="Digital Archive"
              description="Join thousands documenting the festival. Contribute your sightings and high-res photography."
              header={<div className="h-32 w-full bg-falla-sage/5 rounded-2xl flex items-center justify-center border-2 border-falla-sage/10"><Camera size={48} weight="thin" className="text-falla-sage/40" /></div>}
              icon={<Camera size={24} weight="bold" className="text-falla-sage" />}
            />
            <BentoGridItem
              title="Community Pulse"
              description="Go beyond the surface. Read community notes and discover the satirical stories behind each hand-crafted masterpiece."
              header={<div className="h-32 w-full bg-falla-mustard/5 rounded-2xl flex items-center justify-center border-2 border-falla-mustard/10"><ChatCircleDots size={48} weight="thin" className="text-falla-mustard/40" /></div>}
              icon={<ChatCircleDots size={24} weight="bold" className="text-falla-fire" />}
              className="md:col-span-3"
            />
          </BentoGrid>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-16 w-full rounded-[4rem] bg-falla-ink text-falla-paper text-center relative overflow-hidden flex flex-col items-center border-[2.5px] border-falla-ink shadow-solid"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10" />
          <h2 className="text-5xl md:text-8xl font-display text-falla-paper mb-8 relative z-10 leading-tight italic">
            Valencia is <span className="text-falla-fire">Burning.</span>
          </h2>
          <p className="max-w-2xl text-xl md:text-2xl font-medium opacity-80 mb-12 relative z-10 tracking-normal italic">
            Be part of the flame. Start exploring and documenting the most incredible festival on earth.
          </p>
          <Button 
            className="bg-falla-fire text-white h-16 px-12 rounded-full text-xl shadow-solid hover:translate-y-[-2px] transition-all relative z-10 border-2 border-falla-ink"
          >
            <Link to="/sign-up">Join the Community</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
