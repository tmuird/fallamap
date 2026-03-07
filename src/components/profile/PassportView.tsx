import { useEffect, useState } from "react";
import localFallas from "../fallas.json";
import { CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function PassportView() {
  const [visitedNumbers, setVisitedNumbers] = useState<string[]>([]);
  
  useEffect(() => {
    const visited = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
    setVisitedNumbers(visited);
  }, []);

  const visitedFallas = localFallas.filter(f => visitedNumbers.includes(f.number));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl">Digital Passport</h2>
        <div className="brutal-pill px-4 py-1 text-xs font-black uppercase text-falla-fire">
          {visitedNumbers.length} Stamps
        </div>
      </div>

      {visitedFallas.length === 0 ? (
        <div className="p-12 text-center bg-white/50 ink-border rounded-3xl border-dashed">
          <p className="font-bold opacity-40 italic text-lg">Your passport is empty. Start exploring València!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visitedFallas.map((falla) => (
            <motion.div 
              key={falla.number}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="bg-white ink-border p-4 rounded-2xl flex flex-col items-center text-center gap-3 soft-shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
                <CheckCircle size={24} weight="fill" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-falla-fire">#{falla.number}</p>
                <p className="text-[11px] font-bold leading-tight line-clamp-2">{falla.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
