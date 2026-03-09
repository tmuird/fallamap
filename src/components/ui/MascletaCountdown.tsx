import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer, Fire, SpeakerHigh } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";

export function MascletaCountdown() {
  const [timeLeft, setTimeData] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isLive, setIsLive] = useState(false);
  const location = useLocation();
  const isMap = location.pathname === "/map";
  const isHome = location.pathname === "/";

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Target is 2:00 PM (14:00) today
      const target = new Date();
      target.setHours(14, 0, 0, 0);

      // If it's already past 2 PM, target 2 PM tomorrow
      if (now > target) {
        // If it's between 2:00 and 2:10, consider it "Live"
        if (now.getHours() === 14 && now.getMinutes() < 10) {
          setIsLive(true);
          setTimeData(null);
          return;
        }
        target.setDate(target.getDate() + 1);
      } else {
        setIsLive(false);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeData({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft && !isLive) return null;
  if (isHome) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "fixed z-[90] pointer-events-none md:pointer-events-auto transition-all duration-500",
        isMap 
          ? "bottom-6 right-6" 
          : "bottom-24 right-6 md:bottom-10"
      )}
    >
      <div className="bg-falla-paper/90 backdrop-blur-md ink-border shadow-solid rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-4 min-w-[200px]">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 ${isLive ? 'bg-falla-fire text-falla-paper border-falla-ink animate-pulse' : 'bg-falla-fire/10 text-falla-fire border-falla-fire/20'}`}>
            {isLive ? <SpeakerHigh size={20} weight="fill" /> : <Timer size={20} weight="bold" />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-ink/40 leading-none mb-1">
              {isLive ? 'Happening Now' : 'Mascletà Daily'}
            </p>
            <h4 className="text-base font-display lowercase leading-none text-falla-ink">
              {isLive ? 'nit del foc' : 'Next Explosion'}
            </h4>
          </div>
        </div>

        {isLive ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-falla-fire/5 rounded-xl border border-falla-fire/10">
            <Fire size={14} weight="fill" className="text-falla-fire" />
            <span className="text-xs font-black uppercase text-falla-fire tracking-widest">Valencia is Shaking</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 justify-between">
            {timeLeft && (
              <div className="flex gap-1.5 items-baseline">
                <span className="text-2xl font-display text-falla-ink">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-falla-ink/20 uppercase">h</span>
                <span className="text-2xl font-display text-falla-ink">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-falla-ink/20 uppercase">m</span>
                <span className="text-2xl font-display text-falla-fire">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-falla-fire/20 uppercase">s</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
