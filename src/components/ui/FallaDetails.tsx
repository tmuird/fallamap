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
  Eye
} from "@phosphor-icons/react";
import { motion, } from "framer-motion";
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
}

export function FallaDetails({ falla, className, onNext, onPrev, onClose }: FallaDetailsProps) {
  const { user } = useUser();
  const { comments, images, addComment, addImage } = useFallaDetails(falla.number);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [liked, setLiked] = useState(false);
  const [visited, setVisited] = useState(false);

  useEffect(() => {
    const checkInteractions = async () => {
      if (!user || !falla.id) return;
      
      const { data } = await supabase
        .from("user_interactions")
        .select("type")
        .eq("user_id", user.id)
        .eq("falla_id", falla.id);
      
      if (data) {
        setVisited(data.some(i => i.type === "visited"));
        setLiked(data.some(i => i.type === "like"));
      }
    };
    checkInteractions();
  }, [user, falla.id]);

  const toggleInteraction = async (type: 'like' | 'visited') => {
    if (!user) {
      toast.error("Please sign in to use this feature");
      return;
    }

    const currentState = type === 'like' ? liked : visited;
    const setState = type === 'like' ? setLiked : setVisited;

    try {
      if (currentState) {
        await supabase.from("user_interactions").delete().eq("user_id", user.id).eq("falla_id", falla.id).eq("type", type);
        setState(false);
        toast.info(type === 'like' ? "Removed from collection" : "Removed from passport");
      } else {
        await supabase.from("user_interactions").insert([{ user_id: user.id, falla_id: falla.id, type }]);
        setState(true);
        toast.success(type === 'like' ? "Saved to collection! ❤️" : "Stamped in passport! 🦇");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id, isPrivate);
    if (!error) {
      setNewComment("");
      toast.success(isPrivate ? "Private note saved!" : "Note shared with community!");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Igniting upload...");
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${falla.number}-${Math.random()}.${fileExt}`;
      const filePath = `falla-images/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("community-content").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("community-content").getPublicUrl(filePath);

      await addImage(publicUrl, user?.id, isPrivate);
      toast.success(isPrivate ? "Private photo saved!" : "Photo shared with community!", { id: toastId });
    } catch (error: any) {
      toast.error("Upload failed", { id: toastId });
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
      <header className="p-4 md:p-8 pb-4 md:pb-6 border-b-2 border-falla-ink bg-[#FAF7F2] sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="flex items-center gap-1 bg-white rounded-xl ink-border p-0.5 soft-shadow-sm">
              <Button isIconOnly variant="ghost" size="sm" onClick={onPrev} className="w-8 h-8 rounded-lg"><CaretLeft size={18} weight="bold" /></Button>
              <div className="w-px h-4 bg-falla-ink/10" />
              <Button isIconOnly variant="ghost" size="sm" onClick={onNext} className="w-8 h-8 rounded-lg"><CaretRight size={18} weight="bold" /></Button>
            </div>
            <span className="text-[10px] md:text-[11px] uppercase tracking-wider font-black text-falla-ink/60 px-2.5 py-1">#{falla.number}</span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <Button isIconOnly variant="neutral" size="sm" className={cn("w-9 h-9 rounded-xl border-2 transition-colors", liked && "text-red-500 border-red-500 bg-red-50")} onClick={() => toggleInteraction('like')}><Heart size={20} weight={liked ? "fill" : "bold"} /></Button>
            <Button isIconOnly variant="neutral" size="sm" className="w-9 h-9 rounded-xl border-2" onClick={() => navigator.share?.({ title: falla.name, url: window.location.href })}><ShareNetwork size={20} weight="bold" /></Button>
            {onClose && <Button isIconOnly variant="neutral" size="sm" className="w-9 h-9 rounded-xl border-2 bg-falla-ink text-white ml-1" onClick={onClose}><X size={20} weight="bold" /></Button>}
          </div>
        </div>
        
        <h2 className="text-2xl md:text-6xl font-display text-falla-ink leading-tight mb-4 md:mb-8 tracking-tight">{falla.name}</h2>
        
        <div className="flex gap-2 md:gap-3 items-center">
          <Button 
            variant={visited ? "secondary" : "outline"}
            className={cn("flex-1 h-11 md:h-14 rounded-xl md:rounded-2xl border-2 text-[10px] md:text-xs transition-all", visited && "bg-falla-sage text-white")}
            startContent={<CheckCircle size={18} weight={visited ? "fill" : "bold"} />}
            onClick={() => toggleInteraction('visited')}
          >
            {visited ? "Visited" : "Passport"}
          </Button>
          <input type="file" id={`img-${falla.number}`} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          <Button className="flex-1 h-11 md:h-14 rounded-xl md:rounded-2xl border-2 text-[10px] md:text-xs" isLoading={uploading} startContent={<Camera size={18} weight="bold" />} onClick={() => document.getElementById(`img-${falla.number}`)?.click()}>Upload</Button>
          
          <div className="hidden md:flex items-center gap-2 px-4 h-14 bg-white ink-border rounded-2xl soft-shadow-sm ml-2">
            {isPrivate ? <EyeSlash size={18} weight="bold" className="text-falla-ink/40" /> : <Eye size={18} weight="bold" className="text-falla-fire" />}
            <Switch size="sm" color="warning" isSelected={isPrivate} onValueChange={setIsPrivate} />
            <span className="text-[9px] font-black uppercase text-falla-ink/40">Private</span>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-falla-sand/20 border-b-2 md:border-b-0 md:border-r-2 border-falla-ink overflow-hidden group relative shrink-0">
          {images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {images.map((img, index) => (
                  <CarouselItem key={index} className="h-full">
                    <Image src={img.url} className="object-cover w-full h-full rounded-none" removeWrapper />
                    {img.is_private && <div className="absolute top-4 right-4 bg-falla-ink/80 text-white p-2 rounded-lg backdrop-blur-md"><EyeSlash size={16} weight="bold" /></div>}
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && <><CarouselPrevious className="left-4 bg-white/90 ink-border shadow-none border-2" /><CarouselNext className="right-4 bg-white/90 ink-border shadow-none border-2" /></>}
            </Carousel>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-falla-ink/10 p-8 text-center bg-white/30">
              <Camera size={40} weight="thin" className="mb-3 opacity-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Gallery Empty</span>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-4 md:p-10 flex flex-col bg-[#FAF7F2] relative overflow-hidden flex-1">
          <ScrollArea className="flex-1 pr-2 md:pr-4 scrollbar-hide">
            <div className="space-y-6 pb-40 pt-4">
              {comments.map((comment, i) => (
                <motion.div key={comment.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group/comment border-b border-falla-ink/5 pb-4 last:border-0 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[8px] md:text-[9px] text-falla-fire uppercase tracking-widest">{comment.user_id ? "verified" : "visitor"}</span>
                      {comment.is_private && <EyeSlash size={12} weight="bold" className="text-falla-ink/20" />}
                    </div>
                    <span className="text-[7px] md:text-[8px] text-falla-ink/20 font-bold uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm md:text-xl text-falla-ink font-medium leading-tight">"{comment.text}"</p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2] to-transparent pt-12 z-20">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between md:hidden px-2">
                <span className="text-[10px] font-black uppercase text-falla-ink/40">{isPrivate ? "Private Mode" : "Public Mode"}</span>
                <Switch size="sm" color="warning" isSelected={isPrivate} onValueChange={setIsPrivate} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white ink-border rounded-xl md:rounded-[2rem] shadow-solid hover:shadow-none transition-all overflow-hidden focus-within:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-0 border-2">
                  <Textarea variant="flat" placeholder="Share a story..." value={newComment} onChange={(e) => setNewComment(e.target.value)} minRows={1} maxRows={2} className="w-full" classNames={{ input: "text-sm md:text-lg p-3 md:p-5 font-bold bg-transparent placeholder:text-falla-ink/20", inputWrapper: "bg-transparent p-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent" }} />
                </div>
                <Button isIconOnly onClick={handleCommentSubmit} disabled={!newComment.trim()} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] shrink-0 border-2"><PaperPlaneRight size={20} weight="bold" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
