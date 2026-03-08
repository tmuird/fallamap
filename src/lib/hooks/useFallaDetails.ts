import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";

export function useFallaDetails(fallaNumber?: string, hubId?: string) {
  const { user } = useUser();
  const [internalId, setInternalId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let dbId = hubId || null;

        if (fallaNumber && !hubId) {
          const { data: falla } = await supabase
            .from("fallas")
            .select("id")
            .eq("number", fallaNumber)
            .single();
          if (falla) dbId = falla.id;
        }

        if (!dbId) {
          setLoading(false);
          return;
        }

        setInternalId(dbId);

        // 1. Fetch Comments
        const commentQuery = supabase.from("comments").select("*").neq("status", "rejected").order("created_at", { ascending: false });
        if (hubId) commentQuery.eq("hub_id", hubId);
        else commentQuery.eq("falla_id", dbId);

        const { data: allComments } = await commentQuery;
        setComments((allComments || []).filter(c => !c.is_private || c.user_id === user?.id));

        // 2. Fetch Images
        const imageQuery = supabase.from("images").select("*, likes:image_likes(count)").neq("status", "rejected");
        if (hubId) imageQuery.eq("hub_id", hubId);
        else imageQuery.eq("falla_id", dbId);

        const { data: allImages } = await imageQuery;
        const processedImages = (allImages || [])
          .map(img => ({
            ...img,
            likeCount: img.likes?.[0]?.count || 0
          }))
          .filter(img => !img.is_private || img.user_id === user?.id)
          .sort((a, b) => b.likeCount - a.likeCount || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setImages(processedImages);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (fallaNumber || hubId) fetchDetails();
  }, [fallaNumber, hubId, user?.id]);

  const addComment = async (text: string, userId?: string, isPrivate: boolean = false) => {
    if (!internalId && !hubId) return { error: "No ID" };
    const payload: any = { user_id: userId, text, status: "approved", is_private: isPrivate };
    if (hubId) payload.hub_id = hubId;
    else payload.falla_id = internalId;

    const { data, error } = await supabase.from("comments").insert([payload]);
    if (!error) setComments(prev => [{ ...payload, created_at: new Date().toISOString() }, ...prev]);
    return { data, error };
  };

  const addImage = async (url: string, userId?: string, isPrivate: boolean = false) => {
    if (!internalId && !hubId) return { error: "No ID" };
    const payload: any = { user_id: userId, url, status: "approved", is_private: isPrivate };
    if (hubId) payload.hub_id = hubId;
    else payload.falla_id = internalId;

    const { data, error } = await supabase.from("images").insert([payload]);
    if (!error) setImages(prev => [{ ...payload, created_at: new Date().toISOString(), likeCount: 0 }, ...prev]);
    return { data, error };
  };

  const toggleImageLike = async (imageId: string) => {
    if (!user) return;
    const { data: existing } = await supabase.from("image_likes").select("*").eq("user_id", user.id).eq("image_id", imageId).single();
    if (existing) await supabase.from("image_likes").delete().eq("user_id", user.id).eq("image_id", imageId);
    else await supabase.from("image_likes").insert([{ user_id: user.id, image_id: imageId }]);
    
    const { data: refreshed } = await supabase.from("images").select("*, likes:image_likes(count)").eq("id", imageId).single();
    if (refreshed) setImages(prev => prev.map(img => img.id === imageId ? { ...img, likeCount: refreshed.likes?.[0]?.count || 0 } : img));
  };

  return { comments, images, loading, addComment, addImage, toggleImageLike };
}
