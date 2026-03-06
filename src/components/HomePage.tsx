import { useState, useEffect } from "react";
import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Flame, Camera, MessageCircle, Map as MapIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
 const [isVisible, setIsVisible] = useState(true);

 useEffect(() => {
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
   if (window.scrollY > 100 && window.scrollY > lastScrollY) {
    setIsVisible(false);
   } else {
    setIsVisible(true);
   }
   lastScrollY = window.scrollY;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 return (
  <div vaul-drawer-wrapper="" className="min-h-screen bg-falla-paper flex flex-col items-center">
   <AnimatePresence mode="wait">
    {isVisible && (
     <motion.div
      key="header"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full flex justify-center"
     >
      <FallamapHeader isVisible={isVisible} />
     </motion.div>
    )}
   </AnimatePresence>

   <main className="w-full max-w-[1400px] px-4 md:px-8 pb-32 flex flex-col items-center">
    {/* Launch Map Hero Section */}
    <motion.div 
     initial={{ opacity: 0, y: 20 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     className="w-full h-[50vh] md:h-[60vh] rounded-[3rem] overflow-hidden ink-border soft-shadow bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center relative group mb-20"
    >
     <div className="absolute inset-0 bg-falla-ink/40 group-hover:bg-falla-ink/30 transition-colors duration-500" />
     <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-5xl md:text-7xl font-display text-white italic mb-8 drop-shadow-lg">Explore the city.</h2>
      <Button 
       size="lg"
       className="bg-falla-fire text-white h-16 px-12 rounded-full text-xl soft-shadow hover:translate-y-[-2px] transition-all"
      >
       <Link to="/map" className="flex items-center">
        Open Interactive Map <ArrowRight className="ml-2 w-6 h-6" />
       </Link>
      </Button>
     </div>
    </motion.div>
    
    <div className="w-full">
     <div className="flex flex-col items-center mb-16 text-center">
      <div className="brutal-pill mb-6">
        <span className="text-[10px] font-extrabold tracking-widest text-falla-fire">The Platform</span>
      </div>
      <h2 className="text-4xl md:text-6xl font-display text-falla-ink">Built for the <span className="text-falla-fire">Fire</span></h2>
     </div>

     <BentoGrid className="max-w-6xl mx-auto">
      <BentoGridItem
       title="Live Discovery"
       description="Navigate Valencia's ephemeral landscape with real-time tracking of every major monument and neighborhood ninot."
       header={<div className="h-32 w-full bg-falla-fire/5 rounded-3xl flex items-center justify-center border-2 border-falla-fire/10"><MapIcon className="w-12 h-12 text-falla-fire/40" /></div>}
       icon={<Flame className="w-5 h-5 text-falla-fire" />}
       className="md:col-span-2"
      />
      <BentoGridItem
       title="Digital Archive"
       description="Join thousands documenting the festival. Contribute your sightings and high-res photography."
       header={<div className="h-32 w-full bg-falla-sage/5 rounded-2xl flex items-center justify-center border-2 border-falla-sage/10"><Camera className="w-12 h-12 text-falla-sage/40" /></div>}
       icon={<Camera className="w-5 h-5 text-falla-sage" />}
      />
      <BentoGridItem
       title="Community Pulse"
       description="Go beyond the surface. Read community notes and discover the satirical stories behind each hand-crafted masterpiece."
       header={<div className="h-32 w-full bg-falla-mustard/5 rounded-2xl flex items-center justify-center border-2 border-falla-mustard/10"><MessageCircle className="w-12 h-12 text-falla-mustard/40" /></div>}
       icon={<MessageCircle className="w-5 h-5 text-falla-fire" />}
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
     <h2 className="text-5xl md:text-8xl font-display text-falla-paper mb-8 relative z-10 leading-tight">
      Valencia is <span className="text-falla-fire">Burning.</span>
     </h2>
     <p className="max-w-2xl text-xl md:text-2xl font-medium opacity-80 mb-12 relative z-10 tracking-normal">
      Be part of the flame. Start exploring and documenting the most incredible festival on earth.
     </p>
     <button className="px-12 py-6 bg-falla-fire text-falla-paper rounded-2xl font-extrabold tracking-widest hover:scale-105 active:scale-95 transition-all soft-shadow hover:shadow-none translate-y-[-2px] relative z-10 ink-border">
      Enter the Map
     </button>
    </motion.div>
   </main>
  </div>
 );
}
