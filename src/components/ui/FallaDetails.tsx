"use client";
import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Image, Textarea, Switch } from "@heroui/react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useUser } from "@clerk/react";
import { useFallaDetails } from "@/lib/hooks/useFallaDetails";
import { supabase } from "@/lib/supabase";
import { 
  Camera, 
  PaperPlaneRight, 
  Heart, 
  ShareNetwork, 
  CaretLeft, 
  CaretRight, 
  X,
  CheckCircle,
  EyeSlash,
  Eye,
  MapPin
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Falla {
  id?: string;
  number: string;
  name: string;
  time: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

interface FallaDetailsProps {
  falla: Falla;
  className?: string;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
  onInteraction?: () => void;
}

export function FallaDetails({ falla, className, onNext, onPrev, onClose, onInteraction }: FallaDetailsProps) {
  const { user } = useUser();
  const { comments, images, addComment, addImage } = useFallaDetails(falla.number);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [liked, setLiked] = useState(false);
  const [visited, setVisited] = useState(false);

  useEffect(() => {
    const checkInteractions = async () => {
      const localV = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
      const localL = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
      setVisited(localV.includes(falla.number));
      setLiked(localL.includes(falla.number));

      if (user && falla.id) {
        const { data } = await supabase
          .from("user_interactions")
          .select("type")
          .eq("user_id", user.id)
          .eq("falla_id", falla.id);
        
        if (data) {
          setVisited(data.some(i => i.type === "visited"));
          setLiked(data.some(i => i.type === "like"));
        }
      }
    };
    checkInteractions();
  }, [user, falla.id, falla.number]);

  const toggleInteraction = async (type: 'like' | 'visited') => {
    const currentState = type === 'like' ? liked : visited;
    const setState = type === 'like' ? setLiked : setVisited;
    const localKey = type === 'like' ? "liked_fallas" : "visited_fallas";

    // Optimistic
    setState(!currentState);
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    let newLocal = currentState ? local.filter((n: string) => n !== falla.number) : [...local, falla.number];
    localStorage.setItem(localKey, JSON.stringify(newLocal));
    onInteraction?.();

    if (user && falla.id) {
      try {
        if (currentState) {
          await supabase.from("user_interactions").delete().eq("user_id", user.id).eq("falla_id", falla.id).eq("type", type);
        } else {
          await supabase.from("user_interactions").insert([{ user_id: user.id, falla_id: falla.id, type }]);
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    }
    toast.success(currentState ? "Removed" : "Added!");
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id, isPrivate);
    if (!error) {
      setNewComment("");
      toast.success(isPrivate ? "Private note saved!" : "Note shared!");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading("Uploading...");
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${falla.number}-${Math.random()}.${fileExt}`;
      const filePath = `falla-images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("community-content").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("community-content").getPublicUrl(filePath);
      await addImage(publicUrl, user?.id, isPrivate);
      toast.success("Done!", { id: toastId });
    } catch (error: any) {
      toast.error("Failed", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      key={falla.number}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex flex-col w-full h-full bg-[#FAF7F2]", className)}
    >
      <header className="p-6 md:p-10 pb-6 border-b-2 border-falla-ink bg-[#FAF7F2] sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white rounded-xl ink-border p-0.5 shadow-sm">
              <Button isIconOnly variant="ghost" size="sm" onClick={onPrev} className="w-8 h-8 rounded-lg"><CaretLeft size={18} weight="bold" /></Button>
              <div className="w-px h-4 bg-falla-ink/10" />
              <Button isIconOnly variant="ghost" size="sm" onClick={onNext} className="w-8 h-8 rounded-lg"><CaretRight size={18} weight="bold" /></Button>
            </div>
            <div className="brutal-pill px-3 py-1 bg-white shadow-none text-[10px] font-black border-2">#{falla.number}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button isIconOnly variant="neutral" size="sm" className={cn("w-10 h-10 rounded-xl border-2 transition-all", liked && "text-red-500 border-red-500 bg-red-50")} onClick={() => toggleInteraction('like')}><Heart size={22} weight={liked ? "fill" : "bold"} /></Button>
            <Button isIconOnly variant="neutral" size="sm" className="w-10 h-10 rounded-xl border-2" onClick={() => navigator.share?.({ title: falla.name, url: window.location.href })}><ShareNetwork size={22} weight="bold" /></Button>
            {onClose && <Button isIconOnly variant="neutral" size="sm" className="w-10 h-10 rounded-xl border-2 bg-falla-ink text-white ml-1" onClick={onClose}><X size={22} weight="bold" /></Button>}
          </div>
        </div>
        
        <h2 className="text-3xl md:text-7xl font-display text-falla-ink leading-[0.9] mb-8 tracking-tighter lowercase">{falla.name}</h2>
        
        {/* Streamlined Action Hub */}
        <div className="flex flex-wrap gap-3 items-center">
          <Button 
            variant={visited ? "secondary" : "outline"}
            className={cn("flex-1 min-w-[120px] h-14 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all", visited && "bg-falla-sage text-white shadow-none")}
            startContent={<CheckCircle size={20} weight={visited ? "fill" : "bold"} />}
            onClick={() => toggleInteraction('visited')}
          >
            {visited ? "Visited" : "Passport"}
          </Button>
          
          <div className="flex-1 min-w-[140px] flex items-center gap-2">
            <input type="file" id={`img-${falla.number}`} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            <Button className="w-full h-14 rounded-2xl border-2 text-xs font-black uppercase tracking-widest" isLoading={uploading} startContent={<Camera size={20} weight="bold" />} onClick={() => document.getElementById(`img-${falla.number}`)?.click()}>Upload</Button>
          </div>

          <div className="h-14 px-4 bg-white ink-border rounded-2xl flex items-center gap-3 soft-shadow-sm">
            {isPrivate ? <EyeSlash size={20} weight="bold" className="text-falla-ink/30" /> : <Eye size={20} weight="bold" className="text-falla-fire" />}
            <Switch size="sm" color="warning" isSelected={isPrivate} onValueChange={setIsPrivate} />
            <span className="text-[10px] font-black uppercase tracking-wider text-falla-ink/40 hidden sm:block">Private</span>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Gallery */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-falla-sand/10 border-b-2 md:border-b-0 md:border-r-2 border-falla-ink overflow-hidden relative shrink-0">
          {images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {images.map((img, index) => (
                  <CarouselItem key={index} className="h-full relative">
                    <Image src={img.url} className="object-cover w-full h-full rounded-none" removeWrapper />
                    {img.is_private && <div className="absolute top-4 right-4 bg-falla-ink/80 text-white p-2 rounded-xl backdrop-blur-md border-2 border-white/20"><EyeSlash size={18} weight="bold" /></div>}
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && <><CarouselPrevious className="left-4 bg-white/90 ink-border shadow-none border-2" /><CarouselNext className="right-4 bg-white/90 ink-border shadow-none border-2" /></>}
            </Carousel>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-falla-ink/10 p-12 text-center bg-white/30">
              <MapPin size={48} weight="thin" className="mb-4 opacity-5" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Gallery Empty</p>
            </div>
          )}
        </div>

        {/* Community Feed */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col bg-[#FAF7F2] relative overflow-hidden flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
              <PaperPlaneRight size={20} weight="bold" />
            </div>
            <span className="font-display text-xl lowercase italic text-falla-ink">Community Notes</span>
          </div>

          <ScrollArea className="flex-1 pr-4 scrollbar-hide">
            <div className="space-y-8 pb-48 pt-2">
              {comments.map((comment, i) => (
                <motion.div key={comment.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group border-b-2 border-falla-ink/5 pb-6 last:border-0 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-falla-fire">Verified contibutor</span>
                      {comment.is_private && <EyeSlash size={14} weight="bold" className="text-falla-ink/20" />}
                    </div>
                    <span className="text-[8px] text-falla-ink/20 font-bold uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-lg md:text-2xl text-falla-ink font-medium leading-tight">"{comment.text}"</p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2] to-transparent pt-16 z-20">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex-1 bg-white ink-border rounded-[2rem] shadow-solid focus-within:shadow-none transition-all overflow-hidden border-2">
                  <Textarea variant="flat" placeholder="Tell a story..." value={newComment} onChange={(e) => setNewComment(e.target.value)} minRows={1} maxRows={3} className="w-full" classNames={{ input: "text-base md:text-xl p-4 md:p-6 font-bold bg-transparent placeholder:text-falla-ink/20", inputWrapper: "bg-transparent p-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent" }} />
                </div>
                <Button isIconOnly onClick={handleCommentSubmit} disabled={!newComment.trim()} className="w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] shrink-0 border-2"><PaperPlaneRight size={24} weight="bold" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
