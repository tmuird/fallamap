import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ArrowRight, Flame, Camera, ChatCircleDots, MapTrifold } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const communitySightings = [
  {
    quote: "The monument at Plaza del Ayuntamiento is absolutely breathtaking this year. The detail on the main Ninot is insane!",
    name: "Marc V.",
    title: "Verified Citizen",
  },
  {
    quote: "Just uploaded a high-res shot of the Falla in Ruzafa. The lighting at night is magical. Don't miss it!",
    name: "Elena G.",
    title: "Photographer",
  },
  {
    quote: "Found a hidden gem Ninot in a small alley near El Carmen. This map is a lifesaver for tourists!",
    name: "James L.",
    title: "Visitor",
  },
  {
    quote: "The satirical message behind the Falla in Campanar is so sharp. Truly the heart of Valencian culture.",
    name: "Sofia R.",
    title: "Local Guide",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-falla-paper flex flex-col items-center relative overflow-hidden">
      {/* Subtle Sparkle Background */}
      <div className="w-full absolute inset-0 h-screen pointer-events-none">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FF5F1F"
        />
      </div>
      
      <div className="z-10 w-full flex flex-col items-center">
        <FallamapHeader isVisible={true} />

        <main className="w-full max-w-[1400px] px-4 md:px-8 pb-32 flex flex-col items-center">
          {/* Launch Map Hero Section */}
          <div className="w-full flex flex-col gap-10 mb-32 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center max-w-2xl px-4"
            >
              <h2 className="text-4xl md:text-7xl font-display text-falla-ink italic mb-8 leading-tight">
                Discover the Magic.
              </h2>
              <Button 
                size="lg"
                className="bg-falla-fire text-white h-16 px-12 rounded-full text-lg shadow-solid hover:translate-y-[-2px] active:translate-y-0 transition-all border-2 border-falla-ink"
              >
                <Link to="/map" className="flex items-center gap-3">
                  Open Interactive Map <ArrowRight size={24} weight="bold" />
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-[45vh] md:h-[60vh] rounded-[3.5rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
              <div className="absolute bottom-10 left-10 text-white hidden md:block">
                <p className="font-display text-3xl italic drop-shadow-md tracking-normal">València, 2026</p>
                <p className="font-sans font-bold uppercase tracking-[0.3em] opacity-80 text-xs">The world's most flammable stage</p>
              </div>
            </motion.div>
          </div>
          
          {/* Features Bento Grid */}
          <div className="w-full relative py-20">
            <div className="flex flex-col items-center mb-20 text-center">
              <div className="brutal-pill mb-8 bg-white shadow-none border-falla-ink/20">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Features</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display text-falla-ink">The Digital <span className="text-falla-fire">Flame</span></h2>
            </div>

            <BentoGrid className="max-w-6xl mx-auto">
              <BentoGridItem
                title="Live Discovery"
                description="Navigate València's ephemeral landscape with real-time tracking of every major monument and neighborhood ninot."
                header={<div className="h-48 w-full bg-falla-fire/5 rounded-3xl flex items-center justify-center border-2 border-falla-fire/10"><MapTrifold size={64} weight="thin" className="text-falla-fire/40" /></div>}
                icon={<Flame size={28} weight="bold" className="text-falla-fire" />}
                className="md:col-span-2"
              />
              <BentoGridItem
                title="Digital Archive"
                description="Join thousands documenting the festival. Contribute your sightings and high-res photography."
                header={<div className="h-48 w-full bg-falla-sage/5 rounded-2xl flex items-center justify-center border-2 border-falla-sage/10"><Camera size={64} weight="thin" className="text-falla-sage/40" /></div>}
                icon={<Camera size={28} weight="bold" className="text-falla-sage" />}
              />
              <BentoGridItem
                title="Community Pulse"
                description="Go beyond the surface. Read community notes and discover the satirical stories behind each hand-crafted masterpiece."
                header={<div className="h-48 w-full bg-falla-mustard/5 rounded-2xl flex items-center justify-center border-2 border-falla-mustard/10"><ChatCircleDots size={64} weight="thin" className="text-falla-mustard/40" /></div>}
                icon={<ChatCircleDots size={28} weight="bold" className="text-falla-fire" />}
                className="md:col-span-3"
              />
            </BentoGrid>
          </div>

          {/* Community Sightings Section */}
          <div className="w-full py-20 overflow-hidden">
            <div className="flex flex-col items-center mb-16 text-center">
              <div className="brutal-pill mb-8 bg-white shadow-none border-falla-ink/20">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Activity</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display text-falla-ink italic">Street <span className="text-falla-fire">Talk</span></h2>
            </div>
            <InfiniteMovingCards
              items={communitySightings}
              direction="right"
              speed="slow"
            />
          </div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-40 p-20 w-full rounded-[5rem] bg-falla-ink text-falla-paper text-center relative overflow-hidden flex flex-col items-center border-[3px] border-falla-ink shadow-solid-lg"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10" />
            
            <h2 className="text-5xl md:text-9xl font-display text-falla-paper mb-10 relative z-10 leading-none tracking-normal">
              Burn it <span className="text-falla-fire">All.</span>
            </h2>
            <p className="max-w-3xl text-xl md:text-3xl font-medium opacity-80 mb-12 relative z-10 tracking-normal leading-relaxed italic">
              Experience the end of winter and the birth of spring through fire, art, and satirical craftsmanship.
            </p>
            <Button 
              size="lg"
              className="bg-falla-fire text-white h-20 px-16 rounded-full text-2xl shadow-solid hover:translate-y-[-2px] active:translate-y-0 transition-all relative z-10 border-3 border-falla-ink"
            >
              <Link to="/sign-up">Start Your Journey</Link>
            </Button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
