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
import { Image, Textarea } from "@heroui/react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useUser } from "@clerk/react";
import { useFallaDetails } from "@/lib/hooks/useFallaDetails";
import { supabase } from "@/lib/supabase";
import { 
  Clock, 
  Camera, 
  PaperPlaneRight, 
  ChatCircleDots, 
  Heart, 
  ShareNetwork, 
  CaretLeft, 
  CaretRight, 
  X,
  CheckCircle,
  NavigationArrow
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Falla {
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
  const [liked, setLiked] = useState(false);
  const [visited, setVisited] = useState(false);

  useEffect(() => {
    // Check if this falla was visited from local storage
    const visitedFallas = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
    setVisited(visitedFallas.includes(falla.number));

    // Check if liked
    const likedFallas = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
    setLiked(likedFallas.includes(falla.number));
  }, [falla.number]);

  const toggleLiked = () => {
    const likedFallas = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
    let newLiked;
    if (liked) {
      newLiked = likedFallas.filter((n: string) => n !== falla.number);
      toast.info("Removed from collection");
    } else {
      newLiked = [...likedFallas, falla.number];
      toast.success("Added to your collection! ❤️");
    }
    localStorage.setItem("liked_fallas", JSON.stringify(newLiked));
    setLiked(!liked);
  };

  const toggleVisited = () => {
    const visitedFallas = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
    let newVisited;
    if (visited) {
      newVisited = visitedFallas.filter((n: string) => n !== falla.number);
      toast.info("Removed from your passport");
    } else {
      newVisited = [...visitedFallas, falla.number];
      toast.success("Added to your Digital Passport! 🦇", {
        description: `You've checked in at ${falla.name}`
      });
    }
    localStorage.setItem("visited_fallas", JSON.stringify(newVisited));
    setVisited(!visited);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id);
    if (!error) {
      setNewComment("");
      toast.success("Note shared with the community!");
    } else {
      toast.error("Failed to share note");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading photo...");
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${falla.number}-${Math.random()}.${fileExt}`;
      const filePath = `falla-images/${fileName}`;

      // UPLOAD to Supabase
      const { error: uploadError } = await supabase.storage
        .from("community-content")
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error("Supabase Bucket 'community-content' not found. Please create it in your Supabase project.");
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("community-content")
        .getPublicUrl(filePath);

      await addImage(publicUrl, user?.id);
      toast.success("Photo uploaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Upload error:", error.message);
      toast.error(error.message || "Upload failed", { 
        id: toastId,
        duration: 5000 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      key={falla.number}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col w-full h-full bg-[#FAF7F2]", className)}
    >
      <header className="p-4 md:p-8 pb-4 md:pb-6 border-b-2 border-falla-ink bg-[#FAF7F2] sticky top-0 z-30 shadow-sm">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="flex items-center gap-1 bg-white rounded-xl ink-border p-0.5 soft-shadow-sm">
              <Button isIconOnly variant="ghost" size="sm" onClick={onPrev} className="w-8 h-8 rounded-lg">
                <CaretLeft size={18} weight="bold" />
              </Button>
              <div className="w-px h-4 bg-falla-ink/10" />
              <Button isIconOnly variant="ghost" size="sm" onClick={onNext} className="w-8 h-8 rounded-lg">
                <CaretRight size={18} weight="bold" />
              </Button>
            </div>
            <span className="text-[10px] md:text-[11px] uppercase tracking-wider font-black text-falla-ink/60 px-2.5 py-1">
              #{falla.number}
            </span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <Button 
              isIconOnly 
              variant="neutral" 
              size="sm"
              className={cn("w-9 h-9 rounded-xl border-2 transition-colors", liked && "text-red-500 border-red-500 bg-red-50")}
              onClick={toggleLiked}
            >
              <Heart size={20} weight={liked ? "fill" : "bold"} />
            </Button>
            <Button 
              isIconOnly 
              variant="neutral" 
              size="sm"
              className="w-9 h-9 rounded-xl border-2"
              onClick={() => {
                navigator.share?.({ title: falla.name, url: window.location.href });
                toast.info("Sharing options opened");
              }}
            >
              <ShareNetwork size={20} weight="bold" />
            </Button>
            {onClose && (
              <Button 
                isIconOnly 
                variant="neutral" 
                size="sm"
                className="w-9 h-9 rounded-xl border-2 bg-falla-ink text-white shadow-none hover:bg-falla-ink/90 ml-1"
                onClick={onClose}
              >
                <X size={20} weight="bold" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl md:text-6xl font-display text-falla-ink leading-tight mb-4 md:mb-8 tracking-tight">
          {falla.name}
        </h2>
        
        {/* Main Actions */}
        <div className="flex gap-2 md:gap-3">
          <Button 
            variant={visited ? "secondary" : "outline"}
            className={cn("flex-1 h-11 md:h-14 rounded-xl md:rounded-2xl border-2 text-[10px] md:text-xs transition-all", visited && "bg-falla-sage text-white")}
            startContent={<CheckCircle size={18} weight={visited ? "fill" : "bold"} />}
            onClick={toggleVisited}
          >
            {visited ? "Visited" : "Check-in"}
          </Button>
          <input
            type="file"
            id={`image-upload-${falla.number}`}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          <Button 
            className="flex-1 h-11 md:h-14 rounded-xl md:rounded-2xl border-2 text-[10px] md:text-xs"
            isLoading={uploading}
            startContent={<Camera size={18} weight="bold" />}
            onClick={() => document.getElementById(`image-upload-${falla.number}`)?.click()}
          >
            Upload
          </Button>
          <Button 
            variant="outline"
            className="h-11 md:h-14 rounded-xl md:rounded-2xl border-2 hidden md:flex"
            isIconOnly
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${falla.coordinates.lat},${falla.coordinates.lng}`)}
          >
            <NavigationArrow size={18} weight="bold" className="text-falla-fire" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Visuals */}
        <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-falla-sand/20 border-b-2 md:border-b-0 md:border-r-2 border-falla-ink overflow-hidden group relative shrink-0">
          {images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {images.map((img, index) => (
                  <CarouselItem key={index} className="h-full">
                    <Image src={img.url} className="object-cover w-full h-full rounded-none" removeWrapper />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-white/90 ink-border shadow-none border-2" />
                  <CarouselNext className="right-4 bg-white/90 ink-border shadow-none border-2" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-falla-ink/10 p-8 text-center bg-white/30">
              <Camera size={40} weight="thin" className="mb-3 opacity-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Gallery Empty</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="w-full md:w-1/2 p-4 md:p-10 flex flex-col bg-[#FAF7F2] relative overflow-hidden flex-1">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
                <ChatCircleDots size={20} weight="bold" />
              </div>
              <span className="font-display font-black uppercase tracking-widest text-[10px] md:text-sm">Community Notes</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase text-falla-ink/40 tracking-widest whitespace-nowrap">
              <Clock size={12} weight="bold" /> {falla.time}
            </div>
          </div>
          
          <ScrollArea className="flex-1 pr-2 md:pr-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              <div className="space-y-6 pb-40">
                {comments.length > 0 ? (
                  comments.map((comment, i) => (
                    <motion.div 
                      key={comment.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group/comment border-b border-falla-ink/5 pb-4 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-[8px] md:text-[9px] text-falla-fire uppercase tracking-widest">
                          {comment.user_id ? "verified" : "visitor"}
                        </span>
                        <span className="text-[7px] md:text-[8px] text-falla-ink/20 font-bold uppercase">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm md:text-xl text-falla-ink font-medium leading-tight">
                        {comment.text}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center opacity-10">
                    <ChatCircleDots size={48} weight="thin" className="mb-4" />
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Be the first to speak</p>
                  </div>
                )}
              </div>
            </AnimatePresence>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2] to-transparent pt-12 z-20">
            <div className="flex gap-2 md:gap-4">
              <div className="flex-1 bg-white ink-border rounded-xl md:rounded-[2rem] shadow-solid hover:shadow-none transition-all overflow-hidden focus-within:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-0 border-2">
                <Textarea 
                  variant="flat"
                  placeholder="Share a story..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  minRows={1}
                  maxRows={2}
                  className="w-full"
                  classNames={{
                    input: "text-sm md:text-lg p-3 md:p-5 font-bold bg-transparent placeholder:text-falla-ink/20",
                    inputWrapper: "bg-transparent p-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
                  }}
                />
              </div>
              <Button
                isIconOnly
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] shrink-0 border-2"
              >
                <PaperPlaneRight size={20} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
