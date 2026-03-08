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
import { Textarea, Switch } from "@heroui/react";
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
  MapPin,
  ChatCircleDots,
  LockKey
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
// @ts-ignore
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

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
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { comments, images, addComment, addImage, toggleImageLike } = useFallaDetails(falla.number);
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
    
    toast.success(currentState ? "Removed" : "Added!", {
      description: currentState ? "Unmarked from your journey" : "View your passport 🦇",
      action: {
        label: "View",
        onClick: () => navigate("/profile")
      },
      duration: 4000
    });
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to share notes");
      return;
    }
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user?.id, isPrivate);
    if (!error) {
      setNewComment("");
      toast.success("Note shared!", {
        action: {
          label: "View Profile",
          onClick: () => navigate("/profile")
        }
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Please sign in to upload photos");
      return;
    }
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

  const isSignedIn = isLoaded && !!user;

  return (
    <PhotoProvider 
      maskClosable={true}
      maskOpacity={0.85}
      bannerVisible={false}
      speed={() => 300}
      toolbarRender={({ onClose }) => {
        return (
          <div className="absolute top-6 right-6 z-[1000] flex gap-4">
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all active:scale-90"
            >
              <X size={24} weight="bold" className="text-white" />
            </button>
          </div>
        );
      }}
    >
      <div className={cn("flex flex-col w-full h-full bg-falla-paper", className)}>
        <header className="p-4 md:p-8 pb-6 border-b-2 border-falla-ink bg-falla-paper sticky top-0 z-40 flex flex-col gap-3 shadow-sm shrink-0">
          {/* Header Row 1: Nav & Utils (Now Static) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-falla-paper rounded-full ink-border p-1 shadow-sm border-2">
                <Button isIconOnly variant="ghost" size="sm" onClick={onPrev} className="w-8 h-8 rounded-full text-falla-ink hover:bg-falla-ink/5" aria-label="Previous"><CaretLeft size={18} weight="bold" /></Button>
                <div className="w-px h-4 bg-falla-ink/10" />
                <Button isIconOnly variant="ghost" size="sm" onClick={onNext} className="w-8 h-8 rounded-full text-falla-ink hover:bg-falla-ink/5" aria-label="Next"><CaretRight size={18} weight="bold" /></Button>
              </div>
              <motion.div 
                key={falla.number}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1 bg-falla-paper shadow-none text-[10px] font-black border-2 text-falla-ink rounded-full flex items-center justify-center"
              >
                #{falla.number}
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button isIconOnly variant="neutral" size="sm" className={cn("w-9 h-9 rounded-full border-2 transition-all shadow-solid-sm hover:shadow-none", liked && "text-red-500 border-red-500 bg-red-50 dark:bg-red-950/20")} onClick={() => toggleInteraction('like')} aria-label="Like"><Heart size={20} weight={liked ? "fill" : "bold"} /></Button>
              <Button isIconOnly variant="neutral" size="sm" className="w-9 h-9 rounded-full border-2 text-falla-ink shadow-solid-sm hover:shadow-none" onClick={() => navigator.share?.({ title: falla.name, url: window.location.href })} aria-label="Share"><ShareNetwork size={20} weight="bold" /></Button>
              {onClose && <Button isIconOnly variant="neutral" size="sm" className="w-9 h-9 rounded-full border-2 bg-falla-ink text-falla-paper shadow-solid-sm hover:shadow-none" onClick={onClose} aria-label="Close"><X size={20} weight="bold" /></Button>}
            </div>
          </div>
          
          {/* Header Row 2: Title (Animates) */}
          <AnimatePresence mode="wait">
            <motion.h2 
              key={falla.number}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-2xl md:text-4xl font-display text-falla-ink leading-[0.9] tracking-tighter lowercase line-clamp-2 pr-2 h-14 md:h-20"
            >
              {falla.name}
            </motion.h2>
          </AnimatePresence>
          
          {/* Header Row 3: Action Bar (Static) */}
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
              <input type="file" id={`img-${falla.number}`} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <Button className="w-full h-10 md:h-12 rounded-full border-2 text-[10px] font-black uppercase tracking-widest text-falla-ink shadow-solid-sm hover:shadow-none" isLoading={uploading} startContent={<Camera size={18} weight="bold" />} onClick={() => document.getElementById(`img-${falla.number}`)?.click()}>Upload</Button>
            </div>

            <div className="h-10 md:h-12 px-3 bg-falla-paper ink-border rounded-full flex items-center gap-3 soft-shadow-sm border-2">
              {isPrivate ? <EyeSlash size={18} weight="bold" className="text-falla-ink/30" /> : <Eye size={18} weight="bold" className="text-falla-fire" />}
              <Switch size="sm" color="warning" isSelected={isPrivate} onValueChange={setIsPrivate} aria-label="Private mode" disabled={!isSignedIn} />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-contain bg-falla-paper relative">
          {/* Background Texture for Content Area */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')] z-0" />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={falla.number}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="flex flex-col lg:flex-row w-full min-h-full relative z-10"
            >
            {/* Gallery Section - Fixed Frame Aesthetic */}
            <div className="w-full lg:w-1/2 h-[35vh] md:h-[45vh] lg:h-[calc(100vh-250px)] lg:sticky lg:top-0 bg-zinc-900 border-b-2 lg:border-b-0 lg:border-r-2 border-falla-ink overflow-hidden relative shrink-0">
              {images.length > 0 ? (
                <div className="w-full h-full relative">
                  <div className={cn("w-full h-full", !isSignedIn && "blur-xl grayscale pointer-events-none")}>
                    <Carousel className="w-full h-full">
                      <CarouselContent className="h-full">
                        {images.map((img, index) => (
                          <CarouselItem key={index} className="h-full relative group">
                            <PhotoView src={img.url}>
                              <div className="w-full h-full cursor-zoom-in flex items-center justify-center relative">
                                {/* Blurred Background Layer (Google Maps style) */}
                                <div 
                                  className="absolute inset-0 z-0 blur-3xl opacity-40 scale-125"
                                  style={{ 
                                    backgroundImage: `url(${img.url})`, 
                                    backgroundSize: 'cover', 
                                    backgroundPosition: 'center' 
                                  }}
                                />
                                {/* Dark Overlay for depth */}
                                <div className="absolute inset-0 bg-black/20 z-1" />
                                
                                {/* Main Image Content */}
                                <div className="relative z-10 w-full h-full flex items-center justify-center p-2 md:p-4">
                                  <img 
                                    src={img.url} 
                                    alt={falla.name}
                                    className="max-h-[95%] max-w-[95%] w-auto h-auto object-contain rounded-lg shadow-2xl relative z-20 flex-shrink-0"
                                    loading="lazy" 
                                  />
                                </div>
                              </div>
                            </PhotoView>
                            
                            {/* Refined Image Interaction Overlay */}
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
                      <div className="w-16 h-16 rounded-2xl bg-falla-paper ink-border flex items-center justify-center mb-4 shadow-solid text-falla-ink">
                        <LockKey size={32} weight="fill" className="text-falla-fire" />
                      </div>
                      <h3 className="text-xl font-display italic mb-2 lowercase text-falla-ink">Community Gallery</h3>
                      <p className="text-sm font-bold text-falla-ink/60 max-w-[240px] mb-6">Join the community to see and share festival memories.</p>
                      <Link to="/sign-up" className="w-full max-w-[200px]">
                        <Button className="bg-falla-fire text-falla-paper w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-solid border-2">Join to unlock</Button>
                      </Link>
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
                    <h3 className="text-2xl font-display italic text-falla-ink/40 mb-2 lowercase">Empty Gallery</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-ink/20 max-w-[240px]">Be the first to capture festival memories</p>
                  </div>
                </div>
              )}
            </div>

            {/* Community Feed Section */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col bg-falla-paper min-h-[400px] relative border-l-0 lg:border-l-2 border-falla-ink">
              <div className="flex items-center gap-4 mb-8 lg:mb-12">
                <div className="w-10 h-10 rounded-xl bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
                  <ChatCircleDots size={22} weight="bold" />
                </div>
                <span className="font-display text-2xl lowercase italic text-falla-ink">Community Notes</span>
              </div>

              <div className={cn("space-y-8 pb-40 pt-1", !isSignedIn && "blur-md select-none pointer-events-none")}>
                <AnimatePresence mode="popLayout">
                  {comments.length > 0 ? (
                    comments.map((comment, i) => (
                      <motion.div key={comment.id || i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group border-b-2 border-falla-ink/5 pb-8 last:border-0 relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-falla-fire">Verified contributor</span>
                            {comment.is_private && <EyeSlash size={14} weight="bold" className="text-falla-ink/20" />}
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

              {!isSignedIn && comments.length > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-falla-paper via-transparent to-transparent pt-20">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire bg-falla-paper border-2 border-falla-fire px-6 py-3 rounded-xl shadow-solid">Sign up to read more</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Input - Modern Integrated Floating Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-falla-paper via-falla-paper to-transparent pt-24 z-40 pointer-events-none">
        <div className="flex gap-4 pointer-events-auto max-w-4xl mx-auto w-full items-end">
          <div className={cn("flex-1 bg-falla-paper ink-border rounded-[2.5rem] shadow-solid focus-within:shadow-none transition-all overflow-hidden border-2", !isSignedIn && "opacity-50 grayscale")}>
            <Textarea 
              variant="flat" 
              placeholder={isSignedIn ? "Tell a story..." : "Sign in to share..."} 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              minRows={1} 
              maxRows={4} 
              className="w-full" 
              disabled={!isSignedIn} 
              classNames={{ 
                input: "text-fluid-base md:text-fluid-lg p-6 md:p-10 font-bold bg-transparent placeholder:text-falla-ink/20 text-falla-ink leading-tight", 
                inputWrapper: "bg-transparent p-0 shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent" 
              }} 
            />
          </div>
          <Button 
            isIconOnly 
            onClick={handleCommentSubmit} 
            disabled={!newComment.trim() || !isSignedIn} 
            className="w-16 h-16 md:w-28 md:h-28 rounded-[2rem] md:rounded-[3rem] shrink-0 border-2 bg-falla-fire text-falla-paper shadow-solid active:shadow-none transition-all" 
            aria-label="Send"
          >
            <PaperPlaneRight size={window.innerWidth > 768 ? 36 : 28} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  </PhotoProvider>
);
}
