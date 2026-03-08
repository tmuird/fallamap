import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";



export function useFallaDetails(fallaNumber: string) {
  const { user } = useUser();
  const [fallaId, setFallaId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data: falla } = await supabase
          .from("fallas")
          .select("id")
          .eq("number", fallaNumber)
          .single();

        if (!falla) {
          setLoading(false);
          return;
        }

        const id = falla.id;
        setFallaId(id);

        // 1. Fetch Comments
        const { data: allComments } = await supabase
          .from("comments")
          .select("*")
          .eq("falla_id", id)
          .neq("status", "rejected")
          .order("created_at", { ascending: false });
        
        setComments((allComments || []).filter(c => !c.is_private || c.user_id === user?.id));

        // 2. Fetch Images with Like Counts
        // Note: For prototype we join with image_likes count
        const { data: allImages } = await supabase
          .from("images")
          .select(`
            *,
            likes:image_likes(count)
          `)
          .eq("falla_id", id)
          .neq("status", "rejected");

        const processedImages = (allImages || [])
          .map(img => ({
            ...img,
            likeCount: img.likes?.[0]?.count || 0
          }))
          .filter(img => !img.is_private || img.user_id === user?.id)
          // Sort by Like Count (Descending), then date
          .sort((a, b) => b.likeCount - a.likeCount || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setImages(processedImages);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (fallaNumber) fetchDetails();
  }, [fallaNumber, user?.id]);

  const addComment = async (text: string, userId?: string, isPrivate: boolean = false) => {
    if (!fallaId) return { error: "No falla ID" };
    const { data, error } = await supabase.from("comments").insert([
      { falla_id: fallaId, user_id: userId, text, status: "approved", is_private: isPrivate },
    ]);
    if (!error) setComments(prev => [{ text, user_id: userId, created_at: new Date().toISOString(), status: "approved", is_private: isPrivate }, ...prev]);
    return { data, error };
  };

  const addImage = async (url: string, userId?: string, isPrivate: boolean = false) => {
    if (!fallaId) return { error: "No falla ID" };
    const { data, error } = await supabase.from("images").insert([
      { falla_id: fallaId, user_id: userId, url, status: "approved", is_private: isPrivate },
    ]);
    if (!error) setImages(prev => [{ url, user_id: userId, created_at: new Date().toISOString(), status: "approved", is_private: isPrivate, likeCount: 0 }, ...prev]);
    return { data, error };
  };

  const toggleImageLike = async (imageId: string) => {
    if (!user) return;
    
    // Check if already liked
    const { data: existing } = await supabase
      .from("image_likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("image_id", imageId)
      .single();

    if (existing) {
      await supabase.from("image_likes").delete().eq("user_id", user.id).eq("image_id", imageId);
    } else {
      await supabase.from("image_likes").insert([{ user_id: user.id, image_id: imageId }]);
    }
    
    // Refresh images to show new order/counts
    const { data: refreshed } = await supabase.from("images").select("*, likes:image_likes(count)").eq("id", imageId).single();
    if (refreshed) {
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, likeCount: refreshed.likes?.[0]?.count || 0 } : img));
    }
  };

  return { comments, images, loading, addComment, addImage, toggleImageLike };
}
