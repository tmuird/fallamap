import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Card, CardBody } from "@/components/ui/card";
import { CheckCircle, EyeSlash, MapTrifold, Camera, ChatCircleDots } from "@phosphor-icons/react";
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
          supabase
            .from("comments")
            .select("*, fallas(name, number)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("images")
            .select("*, fallas(name, number)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        ]);

        setComments(commentsRes.data || []);
        setImages(imagesRes.data || []);
      } catch (err) {
        console.error("Activity fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, [user]);

  if (!user) return null;
  if (loading && images.length === 0 && comments.length === 0) return null;

  return (
    <div className="space-y-16 mt-16 pt-16 border-t-2 border-falla-ink/5 pb-32">
      {/* Photos Section */}
      <div className="space-y-8 text-falla-ink">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl italic">Your Gallery</h2>
          <div className="brutal-pill px-4 py-1 text-[10px] font-black uppercase text-falla-sage shadow-none border-2">
            {images.length} Uploads
          </div>
        </div>

        {images.length === 0 ? (
          <div className="p-8 text-center bg-falla-paper/30 rounded-3xl border-2 border-dashed border-falla-ink/10">
            <Camera size={32} weight="thin" className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold opacity-30 italic">No photos shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <Link to={`/map?falla=${img.fallas?.number}`} key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden ink-border border-2 hover:translate-y-[-4px] transition-all soft-shadow-sm">
                <Image src={img.url} className="object-cover w-full h-full rounded-none" removeWrapper />
                <div className="absolute inset-0 bg-falla-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex justify-between items-start">
                    {img.is_private && <EyeSlash size={14} weight="bold" className="text-falla-paper/60" />}
                    <MapTrifold size={16} weight="bold" className="text-falla-paper/40 ml-auto" />
                  </div>
                  <p className="text-[8px] text-falla-paper font-black uppercase tracking-widest truncate">
                    #{img.fallas?.number} {img.fallas?.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-8 text-falla-ink">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl italic">Your Notes</h2>
          <div className="brutal-pill px-4 py-1 text-[10px] font-black uppercase text-falla-fire shadow-none border-2">
            {comments.length} Shared
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="p-8 text-center bg-falla-paper/30 rounded-3xl border-2 border-dashed border-falla-ink/10">
            <ChatCircleDots size={32} weight="thin" className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold opacity-30 italic">No stories shared yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Link to={`/map?falla=${comment.fallas?.number}`} key={comment.id} className="block group">
                <Card className="hover:translate-x-1 transition-all border-2 bg-falla-paper">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-3 text-falla-ink">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-falla-fire">
                          Falla #{comment.fallas?.number}
                        </span>
                        {comment.is_private && <EyeSlash size={14} weight="bold" className="opacity-20" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapTrifold size={16} weight="bold" className="opacity-10 group-hover:text-falla-fire transition-colors" />
                        <CheckCircle size={16} weight="fill" className="text-falla-sage" />
                      </div>
                    </div>
                    <p className="font-bold leading-tight italic text-falla-ink truncate">"{comment.text}"</p>
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
