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
import { Button, Image, Textarea } from "@heroui/react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useUser } from "@clerk/react";
import { useFallaDetails } from "@/lib/hooks/useFallaDetails";
import { supabase } from "@/lib/supabase";
import { MapPin, Clock, Camera, Send, MessageCircle } from "lucide-react";

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
}

export function FallaDetails({ falla, className }: FallaDetailsProps) {
  const { user } = useUser();
  const { comments, images, addComment, addImage } = useFallaDetails(falla.number);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id);
    if (!error) {
      setNewComment("");
      alert("Note submitted for review.");
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

      const { error: dbError } = await addImage(publicUrl, user?.id);
      if (!dbError) {
        alert("Photo submitted for review.");
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col w-full h-full bg-falla-paper", className)}>
      <header className="p-8 pb-6 border-b-2 border-falla-ink">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-falla-ink/40">Monument #{falla.number}</span>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-falla-fire tracking-widest">
            <Clock className="w-3.5 h-3.5" /> {falla.time}
          </div>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-falla-ink uppercase leading-[0.85] mb-8">
          {falla.name}
        </h2>
        
        <div className="flex gap-3">
          <Button 
            className="flex-1 ink-border bg-transparent font-bold uppercase tracking-widest text-[10px] rounded-xl h-12"
            startContent={<MapPin className="w-4 h-4" />}
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
            className="flex-1 bg-falla-ink text-falla-paper font-bold uppercase tracking-widest text-[10px] rounded-xl h-12"
            isLoading={uploading}
            startContent={<Camera className="w-4 h-4" />}
            onClick={() => document.getElementById(`image-upload-${falla.number}`)?.click()}
          >
            Upload
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Images */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-falla-sand/30 border-b-2 md:border-b-0 md:border-r-2 border-falla-ink">
          {images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {images.map((img, index) => (
                  <CarouselItem key={index} className="h-full">
                    <Image src={img.url} className="object-cover w-full h-full rounded-none" removeWrapper />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-falla-paper ink-border shadow-none" />
              <CarouselNext className="right-4 bg-falla-paper ink-border shadow-none" />
            </Carousel>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-falla-ink/10 p-12">
              <Camera className="w-12 h-12 mb-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Visuals Pending</span>
            </div>
          )}
        </div>

        {/* Community Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col bg-falla-sand/10">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-4 h-4 text-falla-fire" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Notes</span>
          </div>
          
          <ScrollArea className="flex-1 min-h-[250px] mb-6 pr-4">
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment, i) => (
                  <div key={i} className="border-b border-falla-ink/10 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-[9px] text-falla-fire uppercase tracking-tighter">
                        {comment.user_id ? "Verified" : "Visitor"}
                      </span>
                      <span className="text-[8px] text-falla-ink/30 font-bold uppercase">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-falla-ink font-medium leading-relaxed">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-20 text-center py-12 italic">No notes yet.</p>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea 
              variant="bordered"
              placeholder="Leave a note..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              minRows={1}
              className="flex-1"
              classNames={{
                input: "text-xs font-medium",
                inputWrapper: "border-falla-ink/20 rounded-xl bg-white focus-within:border-falla-ink",
              }}
            />
            <Button
              isIconOnly
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
              className="bg-falla-ink text-falla-paper rounded-xl w-12 h-12 ink-border"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
