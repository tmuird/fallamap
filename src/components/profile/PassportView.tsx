import { useEffect, useState } from "react";
import localFallas from "../fallas.json";
import { SITE } from "@/lib/siteConfig";
import { hubs } from "@/lib/eventData";
import { MapTrifold, Trophy, Image as ImageIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Image } from "@heroui/react";

// A passport entry is a monument (keyed by `number`) or an event hub (keyed by
// `id`) — localStorage holds both kinds under the same keys (FallaDetails
// `identifier`), and interaction DB rows target either `falla_id` or `hub_id`.
interface PassportStamp {
  key: string;
  name: string;
  number?: string;
  hubId?: string;
  topImage?: string;
}

export function PassportView() {
  const { user } = useUser();
  const [visitedData, setVisitedData] = useState<PassportStamp[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPassport = async () => {
      if (!user) {
        const local = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
        setVisitedData(local.map((n: string): PassportStamp => {
          const hub = hubs.find(h => h.id === n);
          return hub
            ? { key: hub.id, hubId: hub.id, name: hub.name }
            : { key: n, number: n, name: localFallas.find(l => l.number === n)?.name ?? "" };
        }));
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
            ),
            hubs (
              id,
              name
            )
          `)
          .eq("user_id", user.id)
          .eq("type", "visited");
        
        if (data) {
          // Rows target a monument (`fallas` join) or a hub (`hubs` join). Hub
          // rows come back with `fallas: null`; the old code dereferenced it
          // unconditionally, so one hub check-in threw on the null join and the
          // catch dropped the ENTIRE passport (T1.7).
          const processed = data.flatMap((item: any): PassportStamp[] => {
            if (item.fallas) {
              const f = item.fallas;
              const topImage = f.images?.find((img: any) => img.status === 'approved')?.url;
              return [{ key: f.number ?? f.id, number: f.number, name: f.name, topImage }];
            }
            if (item.hubs) return [{ key: item.hubs.id, hubId: item.hubs.id, name: item.hubs.name }];
            return [];
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

  // "Explored % of the city" counts monuments only — hub stamps aren't part of
  // the monument dataset and could push the number past 100%.
  const monumentStamps = visitedData.filter(v => !v.hubId).length;

  if (loading && visitedData.length === 0) return null;

  return (
    <div className="space-y-10">
      {/* Achievement Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-falla-fire text-falla-paper ink-border rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-4 shadow-solid">
          <Trophy size={40} weight="fill" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Discovery Progress</p>
            <h3 className="text-4xl font-display italic leading-none">{visitedData.length} Stamps</h3>
          </div>
        </div>
        
        <div className="md:col-span-2 p-8 bg-falla-paper ink-border rounded-[2.5rem] border-2 flex flex-col justify-center relative overflow-hidden text-falla-ink">
          <div className="absolute top-[-20px] right-[-20px] opacity-5">
            <Trophy size={120} weight="fill" />
          </div>
          <p className="text-falla-ink/40 font-bold uppercase text-[10px] tracking-widest mb-2">Explorer Rank</p>
          <h3 className="text-2xl md:text-4xl font-display italic lowercase leading-tight">
            {visitedData.length > 50 ? SITE.profile.rankTop : visitedData.length > 10 ? SITE.profile.rankMid : SITE.profile.rankLow}
          </h3>
          <p className="text-sm font-medium opacity-60 mt-2">You've explored {((monumentStamps / localFallas.length) * 100).toFixed(1)}% of the city.</p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="font-display text-3xl italic text-falla-ink lowercase">digital passport</h2>

        {visitedData.length === 0 ? (
          <div className="p-12 text-center bg-falla-paper/30 ink-border rounded-3xl border-dashed border-2 text-falla-ink">
            <p className="font-bold opacity-40 italic">Your passport is empty. Check-in at monuments on the map!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {visitedData.map((falla) => (
              <Link to={falla.hubId ? `/map?hub=${falla.hubId}` : `/map?falla=${falla.number}`} key={falla.key} className="group">
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="bg-falla-paper ink-border rounded-3xl flex flex-col overflow-hidden soft-shadow-sm h-full group-hover:shadow-none transition-all border-2 relative"
                >
                  {/* Square Background for Stamp */}
                  <div className="aspect-square w-full relative bg-falla-sand overflow-hidden border-b-2 border-falla-ink">
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
                    <p className="text-[9px] font-black uppercase text-falla-fire">{falla.hubId ? "Hub" : `#${falla.number}`}</p>
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
