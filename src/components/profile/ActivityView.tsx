import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Card, CardBody } from "@/components/ui/card";
import { ChatCircleDots, Camera, CheckCircle } from "@phosphor-icons/react";
import { Image } from "@heroui/react";

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
          <h2 className="font-display text-3xl text-falla-ink">Your Gallery</h2>
          <div className="brutal-pill px-4 py-1 text-xs font-black uppercase text-falla-sage">
            {images.length} Uploads
          </div>
        </div>

        {images.length === 0 ? (
          <div className="p-8 text-center bg-white/30 rounded-3xl border-2 border-dashed border-falla-ink/10">
            <Camera size={32} weight="thin" className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold opacity-30">No photos shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="aspect-square rounded-2xl overflow-hidden ink-border relative group">
                <Image src={img.url} className="object-cover w-full h-full" removeWrapper />
                <div className="absolute inset-0 bg-falla-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                  <p className="text-[8px] text-white font-black uppercase tracking-widest truncate">
                    #{img.fallas?.number} {img.fallas?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-falla-ink">Your Notes</h2>
          <div className="brutal-pill px-4 py-1 text-xs font-black uppercase text-falla-fire">
            {comments.length} Shared
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="p-8 text-center bg-white/30 rounded-3xl border-2 border-dashed border-falla-ink/10">
            <ChatCircleDots size={32} weight="thin" className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold opacity-30">No stories shared yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-falla-fire">
                      Falla #{comment.fallas?.number}
                    </span>
                    {comment.status === "approved" && <CheckCircle size={16} weight="fill" className="text-falla-sage" />}
                  </div>
                  <p className="font-bold leading-tight italic">"{comment.text}"</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
