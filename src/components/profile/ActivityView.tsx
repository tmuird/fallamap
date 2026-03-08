import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Card, CardBody } from "@/components/ui/card";
import { CheckCircle, EyeSlash } from "@phosphor-icons/react";
import { Image } from "@heroui/react";
import { Link } from "react-router-dom";

export function ActivityView() {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [commentsRes, imagesRes] = await Promise.all([
          supabase.from("comments").select("*, fallas(name, number)").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("images").select("*, fallas(name, number)").eq("user_id", user.id).order("created_at", { ascending: false })
        ]);

        setComments(commentsRes.data || []);
        setImages(imagesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, [user]);

  if (loading) return null;

  return (
    <div className="space-y-16 mt-16 pt-16 border-t-2 border-falla-ink/5 pb-32">
      {/* Photos Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl italic text-falla-ink">Your Gallery</h2>
          <div className="brutal-pill px-4 py-1 text-[10px] font-black uppercase text-falla-sage bg-white shadow-none">
            {images.length} Uploads
          </div>
        </div>

        {images.length === 0 ? (
          <div className="p-8 text-center bg-white/30 rounded-3xl border-2 border-dashed border-falla-ink/10">
            <p className="text-sm font-bold opacity-30 italic">No photos shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <Link to={`/map?falla=${img.fallas?.number}`} key={img.id}>
                <div className="aspect-square rounded-2xl overflow-hidden ink-border relative group hover:y-[-4px] transition-transform">
                  <Image src={img.url} className="object-cover w-full h-full" removeWrapper />
                  <div className="absolute inset-0 bg-falla-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                    {img.is_private && <EyeSlash size={14} weight="bold" className="text-white/60 self-end" />}
                    <p className="text-[8px] text-white font-black uppercase tracking-widest truncate mt-auto">
                      #{img.fallas?.number} {img.fallas?.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl italic text-falla-ink">Your Notes</h2>
          <div className="brutal-pill px-4 py-1 text-[10px] font-black uppercase text-falla-fire bg-white shadow-none">
            {comments.length} Shared
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="p-8 text-center bg-white/30 rounded-3xl border-2 border-dashed border-falla-ink/10">
            <p className="text-sm font-bold opacity-30 italic">No stories shared yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Link to={`/map?falla=${comment.fallas?.number}`} key={comment.id} className="block">
                <Card className="hover:translate-x-1 transition-transform">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-falla-fire">
                          Falla #{comment.fallas?.number}
                        </span>
                        {comment.is_private && <EyeSlash size={14} weight="bold" className="text-falla-ink/20" />}
                      </div>
                      <CheckCircle size={16} weight="fill" className="text-falla-sage" />
                    </div>
                    <p className="font-bold leading-tight italic">"{comment.text}"</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
