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
import { Textarea } from "@heroui/react";
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
  MapPin,
  ChatCircleDots,
  LockKey,
  CalendarBlank,
  NavigationArrow
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
// @ts-ignore
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

interface POI {
  id?: string;
  number?: string;
  name: string;
  time?: string;
  is_hub?: boolean;
  description?: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

interface FallaDetailsProps {
  falla: POI;
  className?: string;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
  onInteraction?: () => void;
}

export function FallaDetails({ falla, className, onNext, onPrev, onClose, onInteraction }: FallaDetailsProps) {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { comments, images, addComment, addImage, toggleImageLike } = useFallaDetails(falla.number, falla.is_hub ? falla.id : undefined);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [visited, setVisited] = useState(false);

  const identifier = falla.number || falla.id || falla.name;

  const handleGetDirections = () => {
    const { lat, lng } = falla.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const checkInteractions = async () => {
      const localV = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
      const localL = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
      setVisited(localV.includes(identifier));
      setLiked(localL.includes(identifier));

      if (user && (falla.id || identifier)) {
        const query = supabase.from("user_interactions").select("type").eq("user_id", user.id);
        if (falla.is_hub) query.eq("hub_id", falla.id);
        else query.eq("falla_id", falla.id);
        
        const { data } = await query;
        if (data) {
          setVisited(data.some(i => i.type === "visited"));
          setLiked(data.some(i => i.type === "like"));
        }
      }
    };
    checkInteractions();
  }, [user, falla.id, identifier, falla.is_hub]);

  const toggleInteraction = async (type: 'like' | 'visited') => {
    const currentState = type === 'like' ? liked : visited;
    const setState = type === 'like' ? setLiked : setVisited;
    const localKey = type === 'like' ? "liked_fallas" : "visited_fallas";

    setState(!currentState);
    const local = JSON.parse(localStorage.getItem(localKey) || "[]");
    let newLocal = currentState ? local.filter((n: string) => n !== identifier) : [...local, identifier];
    localStorage.setItem(localKey, JSON.stringify(newLocal));
    onInteraction?.();

    if (user && (falla.id || identifier)) {
      try {
        if (currentState) {
          const query = supabase.from("user_interactions").delete().eq("user_id", user.id).eq("type", type);
          if (falla.is_hub) query.eq("hub_id", falla.id);
          else query.eq("falla_id", falla.id);
          await query;
        } else {
          const payload: any = { user_id: user.id, type };
          if (falla.is_hub) payload.hub_id = falla.id;
          else payload.falla_id = falla.id;
          await supabase.from("user_interactions").insert([payload]);
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    }
    
    toast.success(currentState ? "Removed" : "Added!", {
      description: currentState ? "Unmarked from your journey" : "View your passport 🦇",
      action: {
        label: "Passport",
        onClick: () => {
          if (onClose) onClose();
          navigate("/profile");
        }
      },
      duration: 4000
    });
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to share notes", { action: { label: "Join", onClick: () => navigate("/sign-up") } });
      return;
    }
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id, false);
    if (!error) {
      setNewComment("");
      toast.success("Note shared!", { action: { label: "Passport", onClick: () => { if (onClose) onClose(); navigate("/profile"); } } });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Please sign in to upload photos", { action: { label: "Join", onClick: () => navigate("/sign-up") } });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading("Uploading...");
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${identifier}-${Math.random()}.${fileExt}`;
      const filePath = `falla-images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("community-content").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("community-content").getPublicUrl(filePath);
      await addImage(publicUrl, user?.id, false);
      toast.success("Done!", { id: toastId });
    } catch (error: any) {
      toast.error("Failed", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const isSignedIn = isLoaded && !!user;

  return (
    <PhotoProvider maskClosable={true} maskOpacity={0.85} bannerVisible={false} speed={() => 300} toolbarRender={({ onClose }) => (
      <div className="absolute top-6 right-6 z-[1000] flex gap-4">
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all active:scale-90">
          <X size={24} weight="bold" className="text-white" />
        </button>
      </div>
    )}>
      <div className={cn("flex flex-col w-full h-full bg-falla-paper relative overflow-hidden", className)}>
        {/* DESIGN: Glassmorphism Header */}
        <header className="p-4 md:p-8 pb-6 border-b-2 border-falla-ink bg-falla-paper/80 backdrop-blur-xl sticky top-0 z-40 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-falla-paper rounded-full ink-border p-1 shadow-sm border-2">
                <Button isIconOnly variant="ghost" size="sm" onClick={onPrev} className="w-8 h-8 rounded-full text-falla-ink hover:bg-falla-ink/5" aria-label="Previous"><CaretLeft size={18} weight="bold" /></Button>
                <div className="w-px h-4 bg-falla-ink/10" />
                <Button isIconOnly variant="ghost" size="sm" onClick={onNext} className="w-8 h-8 rounded-full text-falla-ink hover:bg-falla-ink/5" aria-label="Next"><CaretRight size={18} weight="bold" /></Button>
              </div>
              <motion.div 
                key={identifier}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "px-3 py-1 shadow-none text-[10px] font-black border-2 rounded-full flex items-center justify-center gap-1.5",
                  falla.is_hub ? "bg-falla-fire text-falla-paper border-falla-ink" : "bg-falla-paper text-falla-ink border-falla-ink"
                )}
              >
                {falla.is_hub ? <CalendarBlank size={12} weight="bold" /> : `#${falla.number}`}
                <span>{falla.is_hub ? "Official Hub" : "Monument"}</span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button isIconOnly variant="neutral" size="sm" className={cn("w-9 h-9 rounded-full border-2 transition-all shadow-solid-sm hover:shadow-none", liked && "text-red-500 border-red-500 bg-red-50 dark:bg-red-950/20")} onClick={() => toggleInteraction('like')} aria-label="Like"><Heart size={20} weight={liked ? "fill" : "bold"} /></Button>
              <Button isIconOnly variant="neutral" size="sm" className="w-9 h-9 rounded-full border-2 text-falla-ink shadow-solid-sm hover:shadow-none" onClick={() => navigator.share?.({ title: falla.name, url: window.location.href })} aria-label="Share"><ShareNetwork size={20} weight="bold" /></Button>
              {onClose && <Button isIconOnly variant="neutral" size="sm" className="w-9 h-9 rounded-full border-2 bg-falla-ink text-falla-paper shadow-solid-sm hover:shadow-none" onClick={onClose} aria-label="Close"><X size={20} weight="bold" /></Button>}
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.h2 
              key={identifier}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="text-2xl md:text-4xl font-display text-falla-ink leading-[0.9] lowercase line-clamp-2 pr-2 min-h-[3.5rem] md:min-h-[5rem]"
            >
              {falla.name}
            </motion.h2>
          </AnimatePresence>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Button 
              variant={visited ? "secondary" : "outline"}
              className={cn("flex-1 min-w-[100px] h-10 md:h-12 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-solid-sm hover:shadow-none", visited && "bg-falla-sage text-falla-paper shadow-none")}
              startContent={<CheckCircle size={18} weight={visited ? "fill" : "bold"} />}
              onClick={() => toggleInteraction('visited')}
            >
              {visited ? "Visited" : "Passport"}
            </Button>
            
            <div className="flex-1 min-w-[120px] flex items-center gap-2">
              <Button 
                variant="outline" 
                className="w-full h-10 md:h-12 rounded-full border-2 text-[10px] font-black uppercase tracking-widest text-falla-ink shadow-solid-sm hover:shadow-none transition-all active:scale-95" 
                startContent={<NavigationArrow size={18} weight="bold" className="text-falla-fire" />}
                onClick={handleGetDirections}
              >
                Directions
              </Button>
            </div>

            <div className="flex-1 min-w-[120px] flex items-center gap-2">
              <input type="file" id={`img-${identifier}`} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <Button className="w-full h-10 md:h-12 rounded-full border-2 text-[10px] font-black uppercase tracking-widest text-falla-ink shadow-solid-sm hover:shadow-none transition-all" isLoading={uploading} startContent={<Camera size={18} weight="bold" />} onClick={() => document.getElementById(`img-${identifier}`)?.click()}>Upload</Button>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-contain bg-falla-paper relative pb-48">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')] z-0" />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={identifier}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: "circOut" }}
              className="flex flex-col lg:flex-row w-full min-h-full relative z-10"
            >
              <div className="w-full lg:w-1/2 h-[35vh] md:h-[45vh] lg:h-[calc(100vh-300px)] lg:sticky lg:top-0 bg-zinc-900 border-b-2 lg:border-b-0 lg:border-r-2 border-falla-ink overflow-hidden relative shrink-0">
                {images.length > 0 ? (
                  <div className="w-full h-full relative">
                    <div className={cn("w-full h-full", !isSignedIn && "blur-xl grayscale pointer-events-none")}>
                      <Carousel className="w-full h-full">
                        <CarouselContent className="h-full">
                          {images.map((img, index) => (
                            <CarouselItem key={index} className="h-full relative group">
                              <PhotoView src={img.url}>
                                <img src={img.url} alt={falla.name} className="w-full h-full object-contain rounded-lg cursor-zoom-in relative z-20" loading="lazy" />
                              </PhotoView>
                              <div className="absolute top-4 left-4 flex gap-2 z-50">
                                <button onClick={(e) => { e.stopPropagation(); toggleImageLike(img.id); }} className="bg-black/40 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center gap-2 text-white">
                                  <Heart size={18} weight={img.likeCount > 0 ? "fill" : "bold"} className={img.likeCount > 0 ? "text-red-500" : "text-white"} />
                                  <span className="text-xs font-black tracking-tighter">{img.likeCount}</span>
                                </button>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {images.length > 1 && isSignedIn && <><CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 shadow-none z-30 text-white w-10 h-10 rounded-lg" /><CarouselNext className="right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 shadow-none z-30 text-white w-10 h-10 rounded-lg" /></>}
                      </Carousel>
                    </div>
                    {!isSignedIn && (
                      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-falla-paper/10 backdrop-blur-[2px]">
                        <div className="w-16 h-16 rounded-2xl bg-falla-paper ink-border flex items-center justify-center mb-4 shadow-solid text-falla-ink"><LockKey size={32} weight="fill" className="text-falla-fire" /></div>
                        <h3 className="text-xl font-display mb-2 lowercase text-falla-ink">Community Gallery</h3>
                        <p className="text-sm font-bold text-falla-ink/60 max-w-[240px] mb-6">Join the community to see and share festival memories.</p>
                        <Link to="/sign-up" className="w-full max-w-[200px]"><Button className="bg-falla-fire text-falla-paper w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-solid border-2">Join to unlock</Button></Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-falla-paper relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/felt.png')] z-0" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-falla-fire/5 border-2 border-falla-fire/10 flex items-center justify-center mb-6 shadow-soft-sm">
                        <Camera size={40} weight="thin" className="text-falla-fire/30" />
                      </div>
                      <h3 className="text-2xl font-display text-falla-ink/40 mb-2 lowercase">Empty Gallery</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-ink/20 max-w-[240px]">Be the first to capture festival memories</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col bg-falla-paper min-h-[400px] relative border-l-0 lg:border-l-2 border-falla-ink">
                {falla.is_hub && falla.description && (
                  <div className="mb-12 p-6 rounded-[2rem] bg-falla-fire/5 border-2 border-falla-fire/10">
                    <p className="text-xs font-black uppercase tracking-widest text-falla-fire mb-2 flex items-center gap-2"><MapPin weight="bold" /> About this location</p>
                    <p className="text-lg font-medium text-falla-ink leading-tight italic">"{falla.description}"</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8 lg:mb-12">
                  <div className="w-10 h-10 rounded-xl bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20"><ChatCircleDots size={22} weight="bold" /></div>
                  <span className="font-display text-2xl lowercase text-falla-ink">Community Notes</span>
                </div>

                <div className={cn("space-y-8 pb-40 pt-1", !isSignedIn && "blur-md select-none pointer-events-none")}>
                  <AnimatePresence mode="popLayout">
                    {comments.length > 0 ? (
                      comments.map((comment, i) => (
                        <motion.div key={comment.id || i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group border-b-2 border-falla-ink/5 pb-8 last:border-0 relative">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black uppercase tracking-widest text-falla-fire">Verified contributor</span>
                            </div>
                            <span className="text-[9px] text-falla-ink/20 font-bold uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-lg md:text-xl text-falla-ink font-medium leading-[1.2]">"{comment.text}"</p>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center opacity-10">
                        <ChatCircleDots size={48} weight="thin" className="mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-ink">Be the first to speak</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {!isSignedIn && comments.length > 0 && <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-falla-paper via-transparent to-transparent pt-20"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire bg-falla-paper border-2 border-falla-fire px-6 py-3 rounded-xl shadow-solid">Sign up to read more</p></div>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DESIGN: Sticky Input with Blur */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-falla-paper/80 backdrop-blur-xl border-t-2 border-falla-ink/10 pt-12 z-40 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-falla-ink/30">
                <ChatCircleDots size={14} weight="bold" />
                <span>Public Community Note</span>
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className={cn("flex-1 bg-falla-paper ink-border rounded-[2.5rem] shadow-solid focus-within:shadow-none transition-all overflow-hidden border-2", !isSignedIn && "opacity-50 grayscale")}>
                <Textarea variant="flat" placeholder={isSignedIn ? "Tell a story..." : "Sign in to share..."} value={newComment} onChange={(e) => setNewComment(e.target.value)} minRows={1} maxRows={4} className="w-full" disabled={!isSignedIn} classNames={{ input: "text-fluid-base md:text-fluid-lg p-6 md:p-10 font-bold bg-transparent placeholder:text-falla-ink/20 text-falla-ink leading-tight", inputWrapper: "bg-transparent p-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent" }} />
              </div>
              <Button isIconOnly onClick={handleCommentSubmit} disabled={!newComment.trim() || !isSignedIn} className="w-16 h-16 md:w-28 md:h-28 rounded-[2rem] md:rounded-[3rem] shrink-0 border-2 bg-falla-fire text-falla-paper shadow-solid active:shadow-none transition-all" aria-label="Send"><PaperPlaneRight size={window.innerWidth > 768 ? 36 : 28} weight="bold" /></Button>
            </div>
          </div>
        </div>
      </div>
    </PhotoProvider>
  );
}
