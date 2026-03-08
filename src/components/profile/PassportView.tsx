import { useEffect, useState } from "react";
import localFallas from "../fallas.json";
import { CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";

export function PassportView() {
  const { user } = useUser();
  const [visitedNumbers, setVisitedNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchVisited = async () => {
      if (!user) {
        const local = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
        setVisitedNumbers(local);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_interactions")
        .select("fallas(number)")
        .eq("user_id", user.id)
        .eq("type", "visited");
      
      if (data) {
        const numbers = data.map((i: any) => i.fallas?.number).filter(Boolean);
        setVisitedNumbers(numbers);
      }
      setLoading(false);
    };
    fetchVisited();
  }, [user]);

  const visitedFallas = localFallas.filter(f => visitedNumbers.includes(f.number));

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl italic">Digital Passport</h2>
        <div className="brutal-pill px-4 py-1 text-[10px] font-black uppercase text-falla-fire bg-white shadow-none">
          {visitedNumbers.length} Stamps
        </div>
      </div>

      {visitedFallas.length === 0 ? (
        <div className="p-12 text-center bg-white/30 ink-border rounded-3xl border-dashed">
          <p className="font-bold opacity-40 italic">Start exploring València to collect stamps.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visitedFallas.map((falla) => (
            <Link to={`/map?falla=${falla.number}`} key={falla.number}>
              <motion.div 
                whileHover={{ y: -5, rotate: 1 }}
                className="bg-white ink-border p-4 rounded-2xl flex flex-col items-center text-center gap-3 soft-shadow-sm h-full"
              >
                <div className="w-12 h-12 rounded-full bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
                  <CheckCircle size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-falla-fire">#{falla.number}</p>
                  <p className="text-[11px] font-bold leading-tight line-clamp-2">{falla.name}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
