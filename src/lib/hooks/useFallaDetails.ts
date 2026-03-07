import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// TOGGLE MODERATION MODE
// Set this to 'false' to make all community content live immediately.
// Set to 'true' to require manual approval in the Admin Dashboard.
const REQUIRE_MODERATION = false;

export function useFallaDetails(fallaNumber: string) {
  const [fallaId, setFallaId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // First get the falla id from its number
        const { data: falla, error: fallaError } = await supabase
          .from("fallas")
          .select("id")
          .eq("number", fallaNumber)
          .single();

        if (fallaError || !falla) {
          console.error("Falla not found in Supabase:", fallaNumber);
          setLoading(false);
          return;
        }

        const id = falla.id;
        setFallaId(id);

        // Fetch comments
        let commentQuery = supabase.from("comments").select("*").eq("falla_id", id);
        
        if (REQUIRE_MODERATION) {
          commentQuery = commentQuery.eq("status", "approved");
        } else {
          // If moderation is off, we show everything except explicitly 'rejected' ones
          commentQuery = commentQuery.neq("status", "rejected");
        }

        const { data: approvedComments } = await commentQuery.order("created_at", { ascending: false });
        setComments(approvedComments || []);

        // Fetch images
        let imageQuery = supabase.from("images").select("*").eq("falla_id", id);
        
        if (REQUIRE_MODERATION) {
          imageQuery = imageQuery.eq("status", "approved");
        } else {
          imageQuery = imageQuery.neq("status", "rejected");
        }

        const { data: approvedImages } = await imageQuery.order("created_at", { ascending: false });
        setImages(approvedImages || []);
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fallaNumber) {
      fetchDetails();
    }
  }, [fallaNumber]);

  const addComment = async (text: string, userId?: string) => {
    if (!fallaId) return { error: "No falla ID" };

    const status = REQUIRE_MODERATION ? "pending" : "approved";

    const { data, error } = await supabase.from("comments").insert([
      {
        falla_id: fallaId,
        user_id: userId,
        text,
        status,
      },
    ]);

    // Optimistic update for immediate feedback when moderation is off
    if (!REQUIRE_MODERATION && !error) {
      const newComment = { 
        text, 
        user_id: userId, 
        created_at: new Date().toISOString(),
        status: "approved" 
      };
      setComments(prev => [newComment, ...prev]);
    }

    return { data, error };
  };

  const addImage = async (url: string, userId?: string) => {
    if (!fallaId) return { error: "No falla ID" };

    const status = REQUIRE_MODERATION ? "pending" : "approved";

    const { data, error } = await supabase.from("images").insert([
      {
        falla_id: fallaId,
        user_id: userId,
        url,
        status,
      },
    ]);

    // Optimistic update
    if (!REQUIRE_MODERATION && !error) {
      const newImg = { 
        url, 
        user_id: userId, 
        created_at: new Date().toISOString(),
        status: "approved" 
      };
      setImages(prev => [newImg, ...prev]);
    }

    return { data, error };
  };

  return { comments, images, loading, addComment, addImage };
}
