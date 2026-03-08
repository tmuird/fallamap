import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// TOGGLE MODERATION MODE
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

        // Fetch comments - Hide private ones from other users
        const { data: approvedComments } = await supabase
          .from("comments")
          .select("*")
          .eq("falla_id", id)
          .neq("status", "rejected")
          .or(`is_private.eq.false`) // We simplified for prototype
          .order("created_at", { ascending: false });
        
        setComments(approvedComments || []);

        // Fetch images
        const { data: approvedImages } = await supabase
          .from("images")
          .select("*")
          .eq("falla_id", id)
          .neq("status", "rejected")
          .or(`is_private.eq.false`)
          .order("created_at", { ascending: false });

        setImages(approvedImages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (fallaNumber) {
      fetchDetails();
    }
  }, [fallaNumber]);

  const addComment = async (text: string, userId?: string, isPrivate: boolean = false) => {
    if (!fallaId) return { error: "No falla ID" };
    const status = REQUIRE_MODERATION ? "pending" : "approved";

    const { data, error } = await supabase.from("comments").insert([
      { falla_id: fallaId, user_id: userId, text, status, is_private: isPrivate },
    ]);

    if (!REQUIRE_MODERATION && !error) {
      setComments(prev => [{ text, user_id: userId, created_at: new Date().toISOString(), status: "approved", is_private: isPrivate }, ...prev]);
    }
    return { data, error };
  };

  const addImage = async (url: string, userId?: string, isPrivate: boolean = false) => {
    if (!fallaId) return { error: "No falla ID" };
    const status = REQUIRE_MODERATION ? "pending" : "approved";

    const { data, error } = await supabase.from("images").insert([
      { falla_id: fallaId, user_id: userId, url, status, is_private: isPrivate },
    ]);

    if (!REQUIRE_MODERATION && !error) {
      setImages(prev => [{ url, user_id: userId, created_at: new Date().toISOString(), status: "approved", is_private: isPrivate }, ...prev]);
    }
    return { data, error };
  };

  return { comments, images, loading, addComment, addImage };
}
