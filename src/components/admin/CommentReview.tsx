import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ChatCircleDots } from "@phosphor-icons/react";

export function CommentReview() {
  const { user } = useUser();
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded admin check for demo purposes.
  const isAdmin = user?.publicMetadata?.role === "admin";

  const fetchPendingComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*, fallas(name, number)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      // Remove from list optimistically
      setPendingComments(prev => prev.filter(comment => comment.id !== id));
    } catch (err) {
      console.error("Error updating comment:", err);
      alert("Failed to update status");
    }
  };

  if (!isAdmin) {
    return null; // The ImageReview component already shows the "Access Denied" message
  }

  if (loading) return null;

  return (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between mb-8 pt-12 border-t-2 border-falla-ink/10">
        <h2 className="font-display text-3xl text-falla-ink">Comment Queue</h2>
        <span className="brutal-pill px-4 py-1 text-xs font-black uppercase text-falla-mustard">
          {pendingComments.length} Pending
        </span>
      </div>

      {pendingComments.length === 0 ? (
        <div className="p-12 text-center bg-white/50 ink-border rounded-3xl border-dashed">
          <p className="font-bold opacity-40">No pending comments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingComments.map((comment) => (
            <Card key={comment.id}>
              <CardBody className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0 w-12 h-12 bg-falla-mustard/10 text-falla-mustard rounded-2xl flex items-center justify-center border-2 border-falla-mustard/20">
                  <ChatCircleDots size={24} weight="bold" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-falla-ink px-2 py-0.5 rounded-md">
                      Falla #{comment.fallas?.number}
                    </span>
                    <span className="text-xs font-bold text-falla-ink/40 uppercase tracking-widest">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-bold text-lg leading-snug">"{comment.text}"</p>
                  <p className="text-xs text-falla-ink/50 font-bold uppercase mt-2">
                    By: {comment.user_id ? "Verified User" : "Anonymous"}
                  </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <Button 
                    variant="outline" 
                    isIconOnly
                    className="h-12 w-12 text-falla-ink"
                    onClick={() => handleUpdateStatus(comment.id, "rejected")}
                  >
                    <X weight="bold" size={20} />
                  </Button>
                  <Button 
                    className="h-12 w-12 bg-falla-sage"
                    isIconOnly
                    onClick={() => handleUpdateStatus(comment.id, "approved")}
                  >
                    <Check weight="bold" size={20} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
