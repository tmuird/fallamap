import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";

// TOGGLE MODERATION MODE
const REQUIRE_MODERATION = false;

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
        const { data: falla, error: fallaError } = await supabase
          .from("fallas")
          .select("id")
          .eq("number", fallaNumber)
          .single();

        if (fallaError || !falla) {
          setLoading(false);
          return;
        }

        const id = falla.id;
        setFallaId(id);

        // Fetch comments
        // Show: approved OR (pending AND is mine)
        // AND (not private OR is mine)
        let commentQuery = supabase
          .from("comments")
          .select("*")
          .eq("falla_id", id)
          .neq("status", "rejected");
        
        const { data: allComments } = await commentQuery.order("created_at", { ascending: false });
        
        // Filter in JS for complex privacy logic (simpler for prototype)
        const filteredComments = (allComments || []).filter(c => {
          if (!c.is_private) return true;
          return c.user_id === user?.id;
        });
        setComments(filteredComments);

        // Fetch images
        let imageQuery = supabase
          .from("images")
          .select("*")
          .eq("falla_id", id)
          .neq("status", "rejected");

        const { data: allImages } = await imageQuery.order("created_at", { ascending: false });
        
        const filteredImages = (allImages || []).filter(img => {
          if (!img.is_private) return true;
          return img.user_id === user?.id;
        });
        setImages(filteredImages);

      } catch (err) {
        console.error("Fetch details error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fallaNumber) {
      fetchDetails();
    }
  }, [fallaNumber, user?.id]);

  const addComment = async (text: string, userId?: string, isPrivate: boolean = false) => {
    if (!fallaId) return { error: "No falla ID" };
    const status = REQUIRE_MODERATION ? "pending" : "approved";

    const { data, error } = await supabase.from("comments").insert([
      { 
        falla_id: fallaId, 
        user_id: userId, 
        text, 
        status, 
        is_private: isPrivate 
      },
    ]);

    // Optimistic update
    if (!error) {
      setComments(prev => [{ 
        text, 
        user_id: userId, 
        created_at: new Date().toISOString(), 
        status, 
        is_private: isPrivate 
      }, ...prev]);
    }
    return { data, error };
  };

  const addImage = async (url: string, userId?: string, isPrivate: boolean = false) => {
    if (!fallaId) return { error: "No falla ID" };
    const status = REQUIRE_MODERATION ? "pending" : "approved";

    const { data, error } = await supabase.from("images").insert([
      { 
        falla_id: fallaId, 
        user_id: userId, 
        url, 
        status, 
        is_private: isPrivate 
      },
    ]);

    if (!error) {
      setImages(prev => [{ 
        url, 
        user_id: userId, 
        created_at: new Date().toISOString(), 
        status, 
        is_private: isPrivate 
      }, ...prev]);
    }
    return { data, error };
  };

  return { comments, images, loading, addComment, addImage };
}
