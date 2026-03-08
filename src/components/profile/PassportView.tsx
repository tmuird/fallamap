import { useEffect, useState } from "react";
import localFallas from "../fallas.json";
import { MapTrifold, Trophy, Image as ImageIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Image } from "@heroui/react";

export function PassportView() {
  const { user } = useUser();
  const [visitedData, setVisitedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPassport = async () => {
      if (!user) {
        const local = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
        setVisitedData(local.map((n: string) => ({ number: n })));
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("user_interactions")
          .select(`
            fallas (
              id,
              number,
              name,
              images (
                url,
                status
              )
            )
          `)
          .eq("user_id", user.id)
          .eq("type", "visited");
        
        if (data) {
          const processed = data.map((item: any) => {
            const f = item.fallas;
            const topImage = f.images?.find((img: any) => img.status === 'approved')?.url;
            return { ...f, topImage };
          });
          setVisitedData(processed);
        }
      } catch (e) {
        console.error("Passport fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, [user]);

  if (loading && visitedData.length === 0) return null;

  return (
    <div className="space-y-10">
      {/* Achievement Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-falla-fire text-white ink-border rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-4 shadow-solid">
          <Trophy size={40} weight="fill" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Discovery Progress</p>
            <h3 className="text-4xl font-display italic leading-none">{visitedData.length} Stamps</h3>
          </div>
        </div>
        
        <div className="md:col-span-2 p-8 bg-white dark:bg-zinc-900 ink-border rounded-[2.5rem] border-2 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] opacity-5">
            <Trophy size={120} weight="fill" />
          </div>
          <p className="text-falla-ink/40 font-bold uppercase text-[10px] tracking-widest mb-2">Explorer Rank</p>
          <h3 className="text-2xl md:text-4xl font-display italic lowercase leading-tight text-falla-ink">
            {visitedData.length > 50 ? "Legend of the Cremà" : visitedData.length > 10 ? "Dedicated Faller" : "Amateur Scout"}
          </h3>
          <p className="text-sm font-medium text-falla-ink/60 mt-2">You've explored {((visitedData.length / localFallas.length) * 100).toFixed(1)}% of the city.</p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="font-display text-3xl italic text-falla-ink lowercase">digital passport</h2>

        {visitedData.length === 0 ? (
          <div className="p-12 text-center bg-white/30 ink-border rounded-3xl border-dashed border-2">
            <p className="font-bold opacity-40 italic">Your passport is empty. Check-in at monuments on the map!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {visitedData.map((falla) => (
              <Link to={`/map?falla=${falla.number}`} key={falla.number} className="group">
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-zinc-900 ink-border rounded-3xl flex flex-col overflow-hidden soft-shadow-sm h-full group-hover:shadow-none transition-all border-2 relative"
                >
                  {/* Square Background for Stamp */}
                  <div className="aspect-square w-full relative bg-falla-sand/20 dark:bg-zinc-800 overflow-hidden border-b-2 border-falla-ink">
                    {falla.topImage ? (
                      <Image 
                        src={falla.topImage} 
                        className="object-cover w-full h-full grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 rounded-none" 
                        removeWrapper
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-falla-ink/10">
                        <ImageIcon size={32} weight="thin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-falla-fire/10 mix-blend-overlay" />
                  </div>

                  <div className="p-4 flex flex-col gap-1 items-center text-center">
                    <p className="text-[9px] font-black uppercase text-falla-fire">#{falla.number}</p>
                    <p className="text-[11px] font-bold leading-[1.1] line-clamp-2 text-falla-ink lowercase">
                      {falla.name || localFallas.find(l => l.number === falla.number)?.name}
                    </p>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapTrifold size={16} weight="bold" className="text-white drop-shadow-md" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
