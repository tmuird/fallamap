import { useEffect, useState } from "react";
import localFallas from "../fallas.json";
import { Heart } from "@phosphor-icons/react";
import { Card, CardBody } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";

export function CollectionView() {
  const { user } = useUser();
  const [likedNumbers, setLikedNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLiked = async () => {
      if (!user) {
        const local = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
        setLikedNumbers(local);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_interactions")
        .select("fallas(number)")
        .eq("user_id", user.id)
        .eq("type", "like");
      
      if (data) {
        const numbers = data.map((i: any) => i.fallas?.number).filter(Boolean);
        setLikedNumbers(numbers);
      }
      setLoading(false);
    };
    fetchLiked();
  }, [user]);

  const likedFallas = localFallas.filter(f => likedNumbers.includes(f.number));

  if (loading) return null;

  return (
    <div className="space-y-8 mt-16 pt-16 border-t-2 border-falla-ink/5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl italic">Saved Collection</h2>
        <div className="brutal-pill px-4 py-1 text-[10px] font-black uppercase text-red-500 bg-white shadow-none">
          {likedNumbers.length} Favorites
        </div>
      </div>

      {likedFallas.length === 0 ? (
        <div className="p-12 text-center bg-white/30 ink-border rounded-3xl border-dashed">
          <p className="font-bold opacity-40 italic">Your collection is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {likedFallas.map((falla) => (
            <Link to={`/map?falla=${falla.number}`} key={falla.number}>
              <Card className="hover:translate-y-[-4px] transition-transform">
                <CardBody className="p-5 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100">
                    <Heart size={24} weight="fill" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-falla-fire mb-0.5">#{falla.number}</p>
                    <h3 className="text-lg font-display italic leading-tight">{falla.name}</h3>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
