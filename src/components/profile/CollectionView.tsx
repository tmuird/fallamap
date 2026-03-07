import { useEffect, useState } from "react";
import localFallas from "../fallas.json";
import { Heart } from "@phosphor-icons/react";

import { Card, CardBody } from "@/components/ui/card";

export function CollectionView() {
  const [likedNumbers, setLikedNumbers] = useState<string[]>([]);
  
  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
    setLikedNumbers(liked);
  }, []);

  const likedFallas = localFallas.filter(f => likedNumbers.includes(f.number));

  return (
    <div className="space-y-8 mt-16 pt-16 border-t-2 border-falla-ink/5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl">Saved Collection</h2>
        <div className="brutal-pill px-4 py-1 text-xs font-black uppercase text-red-500">
          {likedNumbers.length} Favorites
        </div>
      </div>

      {likedFallas.length === 0 ? (
        <div className="p-12 text-center bg-white/50 ink-border rounded-3xl border-dashed">
          <p className="font-bold opacity-40 italic text-lg">Your collection is empty. Tap the heart on a Falla to save it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {likedFallas.map((falla) => (
            <Card key={falla.number}>
              <CardBody className="p-6 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100">
                  <Heart size={28} weight="fill" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase text-falla-fire mb-1">#{falla.number}</p>
                  <h3 className="text-xl font-display italic leading-tight">{falla.name}</h3>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
