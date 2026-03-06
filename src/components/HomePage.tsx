import { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import { FallamapHeader } from "@/components/FallamapHeader.tsx";
import { motion, AnimatePresence } from "framer-motion";

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <FallamapHeader isVisible={isVisible} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full max-w-[1400px] px-4 md:px-8 pb-20 flex flex-col items-center">
        <motion.div 
          layout
          className="w-full h-[65vh] md:h-[75vh] rounded-[2.5rem] overflow-hidden border-2 border-falla-ink shadow-solid bg-falla-sand/20 relative"
        >
          <MapComponent />
        </motion.div>
        
        <section className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-start max-w-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-falla-fire mb-4">Precision</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Live Discovery</h3>
            <p className="text-sm text-falla-ink/60 leading-relaxed font-medium">
              Navigate Valencia's ephemeral landscape with our real-time tracking of every major monument and neighborhood ninot.
            </p>
          </div>

          <div className="flex flex-col items-start max-w-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-falla-fire mb-4">Community</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Digital Archive</h3>
            <p className="text-sm text-falla-ink/60 leading-relaxed font-medium">
              Join thousands documenting the festival. Contribute your sightings and high-res photography to the 2026 collection.
            </p>
          </div>

          <div className="flex flex-col items-start max-w-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-falla-fire mb-4">Heritage</span>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Local Context</h3>
            <p className="text-sm text-falla-ink/60 leading-relaxed font-medium">
              Go beyond the surface. Read community notes and discover the satirical stories behind each hand-crafted masterpiece.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
