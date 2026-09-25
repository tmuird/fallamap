import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";

/**
 * Community content (comments + photos + likes) for one target entity.
 *
 * Single parameterized hook replacing the near-duplicate
 * useFallaDetails/useEventDetails pair. The content column and key depend on
 * the target type:
 *   "monument" → `falla_id`, id = the monument's public `number` (resolved to
 *                the `fallas.id` row uuid before querying — AUDIT §2)
 *   "hub"      → `hub_id`,   id = the hub's stable id
 *   "event"    → `event_id`, id = the schedule event's id
 *
 * `dbId` is the DB-side key content rows use for the current target (resolved
 * `fallas.id` for monuments, the given id for hubs/events), or null while
 * unresolved — callers gate DB writes on it.
 */
export type CommunityTargetType = "monument" | "hub" | "event";

const targetColumn = (type: CommunityTargetType) =>
  type === "monument" ? "falla_id" : type === "hub" ? "hub_id" : "event_id";

export function useCommunityContent(type: CommunityTargetType, id?: string) {
  const { user } = useUser();
  const [internalId, setInternalId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset per target so a target missing from the DB never inherits the
    // previous target's content or row id (AUDIT §2).
    setInternalId(null);
    setComments([]);
    setImages([]);

    if (!id) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Monuments key on the fallas row uuid, resolved from the public
        // `number`; hubs/events key on their stable ids directly.
        let key: string | null = type === "monument" ? null : id;

        if (type === "monument") {
          const { data: falla } = await supabase
            .from("fallas")
            .select("id")
            .eq("number", id)
            .single();
          if (falla) key = falla.id;
        }

        if (!key) {
          setLoading(false);
          return;
        }

        setInternalId(key);
        const column = targetColumn(type);

        // 1. Comments + 2. Images (parallel — same queries as the old hooks)
        const [commentResult, imageResult] = await Promise.all([
          supabase
            .from("comments")
            .select("*")
            .neq("status", "rejected")
            .eq(column, key)
            .order("created_at", { ascending: false }),
          supabase
            .from("images")
            .select("*, likes:image_likes(count)")
            .neq("status", "rejected")
            .eq(column, key),
        ]);

        setComments(
          (commentResult.data || []).filter(
            (c) => !c.is_private || c.user_id === user?.id
          )
        );

        const processedImages = (imageResult.data || [])
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

        setImages(processedImages);
      } catch (err) {
        console.error("[useCommunityContent]", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [type, id, user?.id]);

  // Writes key on the resolved row id for monuments, but hubs/events can write
  // off their stable ids directly (matching the old hooks' guards).
  const writeKey = type === "monument" ? internalId : id ?? null;

  const addComment = async (
    text: string,
    userId?: string,
    isPrivate: boolean = false
  ) => {
    if (!writeKey) return { data: null, error: "No target ID" };
    // New content enters the moderation queue ('pending'); admins approve via
    // /dashboard. RLS only permits non-admins to insert status='pending'.
    const payload: any = {
      user_id: userId,
      text,
      status: "pending",
      is_private: isPrivate,
      [targetColumn(type)]: writeKey,
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
    if (!writeKey) return { data: null, error: "No target ID" };
    const payload: any = {
      user_id: userId,
      url,
      status: "pending",
      is_private: isPrivate,
      [targetColumn(type)]: writeKey,
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

  return {
    comments,
    images,
    loading,
    addComment,
    addImage,
    toggleImageLike,
    dbId: internalId,
  };
}
