import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ArrowRight, Flame, Camera, ChatCircleDots, MapTrifold } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Image } from "@heroui/react";

const communitySightings = [
  {
    quote: "The monument at Plaça de l'Ajuntament is absolutely breathtaking this year. The detail on the main Ninot is insane!",
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

const featuredImages = [
  "/plaza.jpg",
  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?auto=format&fit=crop&q=80&w=800",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-falla-paper flex flex-col items-center relative overflow-hidden">
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
          {/* Main Launch Hero */}
          <div className="w-full flex flex-col gap-10 mb-32 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center max-w-2xl px-4"
            >
              <h2 className="text-4xl md:text-7xl font-display text-falla-ink italic mb-8 leading-tight">
                Discover the Magic.
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-falla-fire text-white h-16 px-12 rounded-full text-lg shadow-solid hover:translate-y-[-2px] active:translate-y-0 transition-all border-2 border-falla-ink"
                >
                  <Link to="/map" className="flex items-center gap-3">
                    Explore Interactive Map <ArrowRight size={24} weight="bold" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-[45vh] md:h-[65vh] rounded-[3.5rem] overflow-hidden ink-border shadow-solid bg-[url('/plaza.jpg')] bg-cover bg-center relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10 text-white hidden md:block">
                <p className="font-display text-3xl italic drop-shadow-md tracking-normal">València, 2026</p>
                <p className="font-sans font-bold uppercase tracking-[0.3em] opacity-80 text-xs text-white">The world's most flammable stage</p>
              </div>
            </motion.div>
          </div>
          
          {/* Featured Moments Gallery */}
          <div className="w-full py-20">
            <div className="flex flex-col items-center mb-16 text-center">
              <div className="brutal-pill mb-8 bg-white shadow-none border-falla-ink/20 px-4 py-1">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Gallery</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display text-falla-ink">Featured <span className="text-falla-fire">Moments</span></h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
              {featuredImages.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="aspect-[3/4] rounded-[2rem] overflow-hidden ink-border soft-shadow group relative"
                >
                  <Image 
                    src={src} 
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                    removeWrapper
                  />
                  <div className="absolute inset-0 bg-falla-fire/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Bento Grid */}
          <div className="w-full relative py-20">
            <div className="flex flex-col items-center mb-20 text-center">
              <div className="brutal-pill mb-8 bg-white shadow-none border-falla-ink/20 px-4 py-1">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Features</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display text-falla-ink">The Digital <span className="text-falla-fire">Flame</span></h2>
            </div>

            <BentoGrid className="max-w-6xl mx-auto">
              <BentoGridItem
                title="Live Discovery"
                description="Navigate València's ephemeral landscape with real-time tracking of every major monument."
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
                description="Go beyond the surface. Read community notes and discover the satirical stories."
                header={<div className="h-48 w-full bg-falla-mustard/5 rounded-2xl flex items-center justify-center border-2 border-falla-mustard/10"><ChatCircleDots size={64} weight="thin" className="text-falla-mustard/40" /></div>}
                icon={<ChatCircleDots size={28} weight="bold" className="text-falla-fire" />}
                className="md:col-span-3"
              />
            </BentoGrid>
          </div>

          {/* Community Sightings Scroller */}
          <div className="w-full py-20 overflow-hidden">
            <div className="flex flex-col items-center mb-16 text-center">
              <div className="brutal-pill mb-8 bg-white shadow-none border-falla-ink/20 px-4 py-1">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Activity</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display text-falla-ink">Street <span className="text-falla-fire">Talk</span></h2>
            </div>
            <InfiniteMovingCards
              items={communitySightings}
              direction="right"
              speed="slow"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
