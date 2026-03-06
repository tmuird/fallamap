import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

        // Fetch approved comments
        const { data: approvedComments } = await supabase
          .from("comments")
          .select("*")
          .eq("falla_id", id)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        setComments(approvedComments || []);

        // Fetch approved images
        const { data: approvedImages } = await supabase
          .from("images")
          .select("*")
          .eq("falla_id", id)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

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

    const { data, error } = await supabase.from("comments").insert([
      {
        falla_id: fallaId,
        user_id: userId,
        text,
        status: "pending", // Default to pending review
      },
    ]);

    return { data, error };
  };

  const addImage = async (url: string, userId?: string) => {
    if (!fallaId) return { error: "No falla ID" };

    const { data, error } = await supabase.from("images").insert([
      {
        falla_id: fallaId,
        user_id: userId,
        url,
        status: "pending",
      },
    ]);

    return { data, error };
  };

  return { comments, images, loading, addComment, addImage };
}
