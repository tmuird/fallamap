"use client";
import { useState } from "react";
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
import { MapPin, Clock, Camera, Send, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id);
    if (!error) {
      setNewComment("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${falla.number}-${Math.random()}.${fileExt}`;
      const filePath = `falla-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-content")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("community-content")
        .getPublicUrl(filePath);

      await addImage(publicUrl, user?.id);
    } catch (error: any) {
      console.error("Error:", error.message);
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
      <header className="p-6 md:p-8 pb-6 border-b-2 border-falla-ink bg-[#FAF7F2] sticky top-0 z-30 shadow-sm">
        {/* Row 1: Badge, Nav, Actions */}
        <div className="flex items-center justify-between mb-6 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-falla-ink/40 bg-falla-ink/5 px-3 py-1.5 rounded-full whitespace-nowrap ink-border">
              Monument #{falla.number}
            </span>
            <div className="flex items-center gap-1">
              <Button isIconOnly variant="neutral" size="sm" onClick={onPrev} className="w-9 h-9 rounded-xl border-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button isIconOnly variant="neutral" size="sm" onClick={onNext} className="w-9 h-9 rounded-xl border-2">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              isIconOnly 
              variant="neutral" 
              size="sm"
              className={cn("w-9 h-9 rounded-xl border-2", liked && "text-falla-fire")}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={cn("w-5 h-5", liked && "fill-current")} />
            </Button>
            <Button 
              isIconOnly 
              variant="neutral" 
              size="sm"
              className="w-9 h-9 rounded-xl border-2"
              onClick={() => navigator.share?.({ title: falla.name, url: window.location.href })}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            {onClose && (
              <Button 
                isIconOnly 
                variant="neutral" 
                size="sm"
                className="w-9 h-9 rounded-xl border-2 bg-falla-ink text-white shadow-none hover:bg-falla-ink/90 ml-2"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Row 2: Title */}
        <h2 className="text-4xl md:text-6xl font-display text-falla-ink leading-[1.1] mb-8 tracking-tight">
          {falla.name}
        </h2>
        
        {/* Row 3: Main Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline"
            className="flex-1 h-14 min-w-[140px] rounded-2xl border-2"
            startContent={<MapPin className="w-5 h-5 text-falla-fire" />}
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${falla.coordinates.lat},${falla.coordinates.lng}`)}
          >
            Locate
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
            className="flex-1 h-14 min-w-[140px] rounded-2xl border-2"
            isLoading={uploading}
            startContent={<Camera className="w-5 h-5" />}
            onClick={() => document.getElementById(`image-upload-${falla.number}`)?.click()}
          >
            Upload
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Visual Experience */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-falla-sand/20 border-b-2 md:border-b-0 md:border-r-2 border-falla-ink overflow-hidden group relative">
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
                  <CarouselPrevious className="left-6 bg-white ink-border shadow-none border-2" />
                  <CarouselNext className="right-6 bg-white ink-border shadow-none border-2" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-falla-ink/10 p-12 text-center bg-white/30">
              <Camera className="w-20 h-20 mb-6 opacity-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Archive empty</span>
            </div>
          )}
        </div>

        {/* Conversation Hub */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-[#FAF7F2] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="font-display font-black uppercase tracking-widest text-sm">Community Notes</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-falla-ink/40 tracking-widest whitespace-nowrap">
              <Clock className="w-4 h-4" /> {falla.time}
            </div>
          </div>
          
          <ScrollArea className="flex-1 pr-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              <div className="space-y-10 pb-40">
                {comments.length > 0 ? (
                  comments.map((comment, i) => (
                    <motion.div 
                      key={comment.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group/comment"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-[10px] text-falla-fire uppercase tracking-widest">
                          {comment.user_id ? "Citizen verified" : "Guest contributor"}
                        </span>
                        <span className="text-[9px] text-falla-ink/20 font-bold uppercase">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xl text-falla-ink font-medium leading-tight tracking-tight">
                        {comment.text}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center opacity-10">
                    <p className="font-display text-6xl font-black uppercase tracking-widest">Quiet</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">Be the first to speak</p>
                  </div>
                )}
              </div>
            </AnimatePresence>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2] to-transparent pt-16 z-20">
            <div className="flex gap-4">
              <div className="flex-1 bg-white ink-border rounded-[2rem] shadow-solid hover:shadow-none transition-all overflow-hidden focus-within:shadow-none translate-y-[-2px] hover:translate-y-0 active:translate-y-0 border-2">
                <Textarea 
                  variant="flat"
                  placeholder="Share a story..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  minRows={1}
                  maxRows={5}
                  className="w-full"
                  classNames={{
                    input: "text-lg p-5 font-bold bg-transparent placeholder:text-falla-ink/20",
                    inputWrapper: "bg-transparent p-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
                  }}
                />
              </div>
              <Button
                isIconOnly
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                className="w-16 h-16 rounded-[1.5rem] shrink-0 border-2"
              >
                <Send className="w-7 h-7" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
