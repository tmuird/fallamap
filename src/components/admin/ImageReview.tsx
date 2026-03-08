import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@heroui/react";
import { Check, X, ShieldCheck } from "@phosphor-icons/react";

export function ImageReview() {
  const { user } = useUser();
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded admin check for demo purposes. 
  // In production, use Clerk Roles or a Supabase Admin table.
  const isAdmin = user?.publicMetadata?.role === "admin";

  const fetchPendingImages = async () => {
    try {
      const { data, error } = await supabase
        .from("images")
        .select("*, fallas(name, number)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingImages(data || []);
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingImages();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("images")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      // Remove from list optimistically
      setPendingImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error("Error updating image:", err);
      alert("Failed to update status");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-falla-paper ink-border rounded-3xl border-2 border-falla-ink">
        <ShieldCheck size={48} weight="thin" className="mx-auto mb-4 text-falla-fire" />
        <h2 className="font-display text-2xl text-falla-ink mb-2">Access Denied</h2>
        <p className="text-sm font-medium opacity-60 text-falla-ink">You must be a Fallamap administrator to review content.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 font-bold animate-pulse">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl text-falla-ink">Photo Queue</h2>
        <span className="brutal-pill px-4 py-1 text-xs font-black uppercase text-falla-fire">
          {pendingImages.length} Pending
        </span>
      </div>

      {pendingImages.length === 0 ? (
        <div className="p-12 text-center bg-white/50 ink-border rounded-3xl border-dashed">
          <p className="font-bold opacity-40">The queue is empty. Go enjoy the Falles!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingImages.map((img) => (
            <Card key={img.id} className="overflow-hidden">
              <div className="aspect-video bg-falla-ink/5 relative">
                <Image src={img.url} className="object-cover w-full h-full rounded-none" removeWrapper />
              </div>
              <CardBody className="p-6">
                <div className="mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-falla-fire mb-1">
                    Falla #{img.fallas?.number}
                  </p>
                  <p className="font-bold leading-tight truncate">
                    {img.fallas?.name}
                  </p>
                  <p className="text-[10px] text-falla-ink/40 font-bold uppercase mt-2">
                    {new Date(img.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3 mt-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-falla-ink"
                    onClick={() => handleUpdateStatus(img.id, "rejected")}
                    startContent={<X weight="bold" />}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-falla-sage"
                    onClick={() => handleUpdateStatus(img.id, "approved")}
                    startContent={<Check weight="bold" />}
                  >
                    Approve
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
