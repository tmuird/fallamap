import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";

/**
 * Hook for fetching and mutating community content tied to a schedule event.
 *
 * Requires these columns to exist on the Supabase tables:
 *   ALTER TABLE comments ADD COLUMN IF NOT EXISTS event_id TEXT;
 *   ALTER TABLE images   ADD COLUMN IF NOT EXISTS event_id TEXT;
 */
export function useEventDetails(eventId?: string) {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setComments([]);
      setImages([]);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [{ data: rawComments }, { data: rawImages }] = await Promise.all([
          supabase
            .from("comments")
            .select("*")
            .eq("event_id", eventId)
            .neq("status", "rejected")
            .order("created_at", { ascending: false }),

          supabase
            .from("images")
            .select("*, likes:image_likes(count)")
            .eq("event_id", eventId)
            .neq("status", "rejected"),
        ]);

        setComments(
          (rawComments || []).filter(
            (c) => !c.is_private || c.user_id === user?.id
          )
        );

        const processed = (rawImages || [])
          .map((img) => ({
            ...img,
            likeCount: img.likes?.[0]?.count || 0,
          }))
          .filter((img) => !img.is_private || img.user_id === user?.id)
          .sort(
            (a, b) =>
              b.likeCount - a.likeCount ||
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        setImages(processed);
      } catch (err) {
        console.error("[useEventDetails]", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventId, user?.id]);

  const addComment = async (
    text: string,
    userId?: string,
    isPrivate: boolean = false
  ) => {
    if (!eventId) return { error: "No event ID" };
    const payload = {
      event_id: eventId,
      user_id: userId,
      text,
      status: "approved",
      is_private: isPrivate,
    };
    const { data, error } = await supabase.from("comments").insert([payload]);
    if (!error) {
      setComments((prev) => [
        { ...payload, created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    return { data, error };
  };

  const addImage = async (
    url: string,
    userId?: string,
    isPrivate: boolean = false
  ) => {
    if (!eventId) return { error: "No event ID" };
    const payload = {
      event_id: eventId,
      user_id: userId,
      url,
      status: "approved",
      is_private: isPrivate,
    };
    const { data, error } = await supabase.from("images").insert([payload]);
    if (!error) {
      setImages((prev) => [
        { ...payload, created_at: new Date().toISOString(), likeCount: 0 },
        ...prev,
      ]);
    }
    return { data, error };
  };

  const toggleImageLike = async (imageId: string) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("image_likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("image_id", imageId)
      .single();

    if (existing) {
      await supabase
        .from("image_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("image_id", imageId);
    } else {
      await supabase
        .from("image_likes")
        .insert([{ user_id: user.id, image_id: imageId }]);
    }

    const { data: refreshed } = await supabase
      .from("images")
      .select("*, likes:image_likes(count)")
      .eq("id", imageId)
      .single();

    if (refreshed) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, likeCount: refreshed.likes?.[0]?.count || 0 }
            : img
        )
      );
    }
  };

  return { comments, images, loading, addComment, addImage, toggleImageLike };
}
