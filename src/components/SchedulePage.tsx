import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Chip } from "@heroui/react";
import {
  MapPin,
  Flame,
  MusicNotes,
  Sparkle,
  CalendarBlank,
  Fire,
  CaretRight,
  ChatCircleDots,
  Camera,
  ShareNetwork,
  X,
  TrendUp,
  Trophy,
  NavigationArrow,
  Heart,
  PaperPlaneRight,
  CalendarPlus,
} from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { useUser } from "@clerk/react";
import { useCommunityContent } from "@/lib/hooks/useCommunityContent";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { schedule, type ScheduleEvent } from "@/lib/eventData";

// ─── Event icons — names live in official_events.json, components stay here ──
const EVENT_ICONS: Record<string, typeof Flame> = {
  flame: Flame,
  trophy: Trophy,
  sparkle: Sparkle,
  camera: Camera,
  "navigation-arrow": NavigationArrow,
  "music-notes": MusicNotes,
  fire: Fire,
};

function EventIcon({ name, size = 24 }: { name: string; size?: number }) {
  const IconComp = EVENT_ICONS[name] ?? Sparkle;
  return <IconComp size={size} weight="bold" />;
}

// ─── ICS helper ──────────────────────────────────────────────────────────────

function buildICS(event: ScheduleEvent, dayDate: string) {
  const [h, m] = event.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");

  const dateStr = dayDate.replace(/-/g, "");
  const startDT = `${dateStr}T${pad(h)}${pad(m)}00`;
  const endH = h + 1 >= 24 ? 0 : h + 1;
  const endDT = `${dateStr}T${pad(endH)}${pad(m)}00`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fallamap//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${event.title} – Las Fallas 2026`,
    `DTSTART;TZID=Europe/Madrid:${startDT}`,
    `DTEND;TZID=Europe/Madrid:${endDT}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description}`,
    `URL:${window.location.href}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "-")}-Fallas2026.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Event drawer community hub ───────────────────────────────────────────────

function EventCommunityHub({ event, dayDate }: { event: ScheduleEvent; dayDate: string }) {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { comments, images, loading, addComment, addImage, toggleImageLike } =
    useCommunityContent("event", event.id);

  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSignedIn = isLoaded && !!user;

  const handleCommentSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to share notes", {
        action: { 
          label: "Join", 
          onClick: () => {
            // If this were in a drawer we'd close it, but SchedulePage hub is in-page.
            // However, we should ensure consistent toast behavior.
            navigate("/sign-up");
          } 
        },
      });
      return;
    }
    if (!newComment.trim()) return;
    const { error } = await addComment(newComment, user.id, false);
    if (!error) {
      setNewComment("");
      toast.success("Note shared — awaiting review");
    } else {
      toast.error("Couldn't post note — check DB migration.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Please sign in to upload photos", {
        action: { label: "Join", onClick: () => navigate("/sign-up") },
      });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading photo...");
    try {
      const ext = file.name.split(".").pop();
      const path = `event-images/${event.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("community-content")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("community-content").getPublicUrl(path);
      const { error } = await addImage(publicUrl, user.id, false);
      if (error) throw error;
      toast.success("Photo shared — awaiting review", { id: toastId });
    } catch {
      toast.error("Upload failed", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/schedule?day=${schedule.find((d) =>
      d.events.some((e) => e.id === event.id)
    )?.id}&event=${event.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${event.title} – Las Fallas 2026`, text: event.description, url });
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!", { description: url });
    }
  };

  const handleAddToCalendar = () => {
    buildICS(event, dayDate);
    toast.success("Calendar file downloaded!", {
      description: "Open the .ics file to add to your calendar app.",
    });
  };

  return (
    <PhotoProvider maskClosable={true} maskOpacity={0.85} bannerVisible={false} speed={() => 300}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-2 border-falla-ink/5 pt-12">
        {/* ── Photo stream ── */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera size={24} weight="bold" className="text-falla-fire" />
              <h3 className="text-2xl font-display lowercase">
                Photo Stream
                {images.length > 0 && (
                  <span className="ml-2 text-sm font-sans font-black text-falla-ink/30">
                    {images.length}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest shadow-solid-sm hover:shadow-none transition-all"
                startContent={<Camera size={16} weight="bold" />}
                isLoading={uploading}
                onClick={() => {
                  if (!isSignedIn) {
                    toast.error("Sign in to post photos", {
                      action: { label: "Join", onClick: () => navigate("/sign-up") },
                    });
                    return;
                  }
                  fileInputRef.current?.click();
                }}
              >
                Post Photo
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-falla-sand/10 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {images.map((img) => (
                <div key={img.id || img.url} className="relative group aspect-square">
                  <PhotoView src={img.url}>
                    <img
                      src={img.url}
                      alt="Community photo"
                      className="w-full h-full object-cover cursor-zoom-in rounded-3xl border-2 border-falla-ink/5 bg-falla-sand/10"
                      loading="lazy"
                    />
                  </PhotoView>
                  {img.id && (
                    <button
                      onClick={() => toggleImageLike(img.id)}
                      className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white transition-all hover:scale-110 active:scale-95"
                    >
                      <Heart
                        size={14}
                        weight={img.likeCount > 0 ? "fill" : "bold"}
                        className={img.likeCount > 0 ? "text-red-400" : "text-white"}
                      />
                      <span className="text-[10px] font-black">{img.likeCount}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!isSignedIn) {
                      toast.error("Sign in to post photos", {
                        action: { 
                          label: "Join", 
                          onClick: () => navigate("/sign-up") 
                        },
                      });
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  className="aspect-square bg-falla-sand/20 rounded-3xl border-2 border-dashed border-falla-ink/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-falla-sand/30 transition-all cursor-pointer"
                >
                  <Camera
                    size={24}
                    weight="thin"
                    className="text-falla-ink/20 mb-2 group-hover:scale-110 transition-transform"
                  />
                  <p className="text-[9px] font-black uppercase text-falla-ink/20 tracking-widest">
                    Be first to share
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="p-8 rounded-[2.5rem] bg-falla-fire/5 border-2 border-falla-fire/10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-falla-fire flex items-center justify-center text-falla-paper shadow-solid-sm shrink-0">
              <TrendUp size={32} weight="bold" />
            </div>
            <div>
              <h4 className="text-lg font-display lowercase leading-none mb-1">
                Trending now
              </h4>
              <p className="text-xs font-medium text-falla-ink/60 leading-relaxed">
                Share your moments — photos and notes make this community hub come alive.
              </p>
            </div>
          </div>
        </div>

        {/* ── Live notes / comments ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChatCircleDots size={24} weight="bold" className="text-falla-sage" />
              <h3 className="text-2xl font-display lowercase">
                Live Notes
                {comments.length > 0 && (
                  <span className="ml-2 text-sm font-sans font-black text-falla-ink/30">
                    {comments.length}
                  </span>
                )}
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-falla-sage bg-falla-sage/10 px-2 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-falla-sage animate-pulse" />
              Active
            </span>
          </div>

          {/* Comment feed */}
          <div className="flex-1 space-y-4 min-h-[200px]">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-falla-sand/10 rounded-2xl animate-pulse"
                />
              ))
            ) : comments.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {comments.map((c, i) => (
                  <motion.div
                    key={c.id || i}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-falla-fire">
                          {c.user_id ? "Community" : "Anonymous"}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-falla-ink/20">
                        {new Date(c.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="p-4 bg-falla-paper border-2 border-falla-ink/5 shadow-solid-sm rounded-2xl group-hover:translate-x-0.5 transition-all">
                      <p className="text-sm font-medium text-falla-ink">"{c.text}"</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                <ChatCircleDots size={40} weight="thin" className="mb-4 text-falla-ink" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-falla-ink">
                  Be first to speak
                </p>
              </div>
            )}
          </div>

          {/* Comment input */}
          <div className="pt-4 border-t-2 border-falla-ink/5 space-y-3">
            <div className="flex items-center gap-2 px-2 text-[9px] font-black uppercase tracking-widest text-falla-ink/30">
              <ChatCircleDots size={12} weight="bold" />
              <span>Public Community Note</span>
            </div>
            <div className="flex gap-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                placeholder={isSignedIn ? "Join the discussion..." : "Sign in to share a note..."}
                disabled={!isSignedIn}
                className="flex-1 bg-falla-paper border-2 border-falla-ink rounded-xl px-5 py-3 text-sm font-bold placeholder:text-falla-ink/20 focus:outline-none focus:border-falla-fire transition-all disabled:opacity-50"
              />
              <Button
                isIconOnly
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || !isSignedIn}
                className="w-12 h-12 bg-falla-fire text-falla-paper border-2 border-falla-ink shadow-solid hover:shadow-none transition-all rounded-xl shrink-0"
              >
                <PaperPlaneRight size={20} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer utils */}
      <div className="mt-16 flex flex-wrap gap-4 pt-12 border-t-2 border-falla-ink/5">
        <Button
          onClick={handleAddToCalendar}
          className="flex-1 min-w-[200px] h-14 bg-falla-fire text-falla-paper border-2 border-falla-ink shadow-solid hover:shadow-none transition-all rounded-xl"
          startContent={<CalendarPlus size={20} weight="bold" />}
        >
          Add to Calendar
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 min-w-[200px] h-14 rounded-xl border-2 shadow-solid hover:shadow-none transition-all"
          startContent={<ShareNetwork size={20} weight="bold" />}
        >
          Share Event
        </Button>
      </div>
    </PhotoProvider>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDayId, setSelectedDayId] = useState(
    searchParams.get("day") || "mar-19"
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentDay = useMemo(
    () => schedule.find((d) => d.id === selectedDayId),
    [selectedDayId]
  );

  const selectedEvent = useMemo(() => {
    const eventId = searchParams.get("event");
    if (!eventId) return null;
    for (const day of schedule) {
      const found = day.events.find((e) => e.id === eventId);
      if (found) return { ...found, dayDate: day.date };
    }
    return null;
  }, [searchParams]);

  useEffect(() => {
    setIsDrawerOpen(!!selectedEvent);
  }, [selectedEvent]);

  const handleEventClick = (event: ScheduleEvent) => {
    setSearchParams({ day: selectedDayId, event: event.id });
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSearchParams({ day: selectedDayId });
  };

  const handleDayChange = (dayId: string) => {
    setSelectedDayId(dayId);
    setSearchParams({ day: dayId });
  };

  return (
    <div className="min-h-screen bg-falla-paper pt-32 md:pt-48 pb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto antialiased relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="brutal-pill inline-block mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire flex items-center gap-2">
              <CalendarBlank size={14} weight="bold" /> The Official Program
            </span>
          </div>
          <h1 className="text-4xl md:text-8xl font-display text-falla-ink mb-6 leading-[0.85] lowercase">
            festival timeline
          </h1>
        </motion.div>

        {/* Sticky day selector */}
        <div className="sticky top-24 md:top-36 z-40 mb-16 py-4 bg-falla-paper/80 backdrop-blur-md flex justify-center">
          <div className="flex bg-falla-sand/20 p-1.5 rounded-[2rem] border-2 border-falla-ink shadow-solid-sm overflow-x-auto scrollbar-hide max-w-full">
            {schedule.map((day) => (
              <button
                key={day.id}
                onClick={() => handleDayChange(day.id)}
                className={cn(
                  "px-6 md:px-10 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedDayId === day.id
                    ? "bg-falla-fire text-falla-paper shadow-solid-sm border-2 border-falla-ink translate-y-[-2px]"
                    : "text-falla-ink/40 hover:text-falla-ink"
                )}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[23px] md:left-[47px] top-0 bottom-0 w-[3px] bg-falla-ink/5 overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full bg-gradient-to-b from-falla-fire via-falla-fire to-transparent opacity-30"
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedDayId}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="ml-16 md:ml-28 mb-10 flex items-center gap-4">
                <h2 className="text-3xl font-display text-falla-fire lowercase leading-none">
                  {currentDay?.subtitle}
                </h2>
                <div className="h-[2px] flex-1 bg-falla-ink/5" />
              </div>

              {currentDay?.events.map((event, index) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <motion.div
                    layoutId={`node-${event.id}`}
                    className="absolute left-[13px] md:left-[37px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-falla-paper border-[3px] border-falla-ink flex items-center justify-center z-10 group-hover:scale-125 transition-all duration-300 shadow-solid-sm group-hover:border-falla-fire"
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        event.isLive
                          ? "bg-falla-fire animate-pulse scale-150"
                          : "bg-falla-ink group-hover:bg-falla-fire"
                      )}
                    />
                  </motion.div>

                  <div className="ml-12 md:ml-20 pl-4 md:pl-8 py-4 flex items-center gap-6 border-b-2 border-falla-ink/5 hover:bg-falla-sand/5 transition-all rounded-2xl group/row relative overflow-hidden">
                    <div className="shrink-0 w-16 md:w-24">
                      <span className="text-xl md:text-2xl font-black text-falla-ink/40 font-sans group-hover:text-falla-ink transition-colors">
                        {event.time}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl md:text-3xl font-display text-falla-ink leading-tight lowercase group-hover:text-falla-fire transition-colors truncate">
                          {event.title}
                        </h3>
                        {event.isLive && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-falla-fire/10 text-falla-fire text-[8px] font-black uppercase tracking-widest rounded-md border border-falla-fire/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-falla-fire animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-falla-ink/30">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} weight="bold" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-falla-ink/20" />
                          <Chip
                            size="sm"
                            variant="flat"
                            color={event.color as any}
                            className="font-black text-[8px] uppercase tracking-widest h-5 px-2 border border-current/10"
                          >
                            {event.type}
                          </Chip>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pr-4">
                      <CaretRight size={24} weight="bold" className="text-falla-fire" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Event detail drawer */}
        <Drawer.Root
          open={isDrawerOpen}
          onOpenChange={(open) => !open && handleDrawerClose()}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
            <Drawer.Content className="bg-transparent flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none items-center">
              <div className="w-full max-w-5xl bg-falla-paper rounded-t-[3rem] border-x-2 border-t-2 border-falla-ink shadow-solid flex flex-col max-h-[92vh] overflow-hidden">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4" />

                {selectedEvent && (
                  <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 pt-4 scrollbar-hide overscroll-contain">
                    {/* Event header */}
                    <header className="flex flex-col gap-6 mb-16 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-falla-ink text-falla-paper flex items-center justify-center shadow-solid-sm">
                            <EventIcon name={selectedEvent.icon} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-3xl font-black text-falla-ink">
                              {selectedEvent.time}
                            </span>
                            <span className="text-[10px] font-black uppercase text-falla-fire tracking-widest">
                              Central European Time
                            </span>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          variant="neutral"
                          className="w-12 h-12 rounded-full border-2 bg-falla-paper"
                          onClick={handleDrawerClose}
                        >
                          <X size={24} weight="bold" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-5xl md:text-8xl font-display text-falla-ink leading-[0.8] lowercase">
                          {selectedEvent.title}
                        </h2>
                        <div className="flex flex-wrap gap-3 items-center">
                          <Chip
                            variant="flat"
                            color={selectedEvent.color as any}
                            className="font-black text-[10px] uppercase tracking-[0.2em] px-4 h-8 border-2 border-current/10"
                          >
                            {selectedEvent.type}
                          </Chip>
                          <div className="flex items-center gap-2 px-5 py-2 bg-falla-sand/20 rounded-full border-2 border-falla-ink/5">
                            <MapPin size={18} weight="bold" className="text-falla-fire" />
                            <span className="text-xs font-bold text-falla-ink uppercase tracking-widest">
                              {selectedEvent.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xl md:text-2xl font-medium leading-tight text-falla-ink/60 max-w-3xl">
                        {selectedEvent.description}
                      </p>
                    </header>

                    {/* Community hub — fully wired */}
                    <EventCommunityHub
                      key={selectedEvent.id}
                      event={selectedEvent}
                      dayDate={selectedEvent.dayDate}
                    />
                  </div>
                )}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        {/* Footer note */}
        <div className="mt-20 p-10 rounded-[2.5rem] bg-falla-sand/10 border-2 border-dashed border-falla-ink/10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-falla-ink/30 mb-3 italic">
            "Senyor pirotècnic, pot començar la mascletà!"
          </p>
          <p className="text-xs font-bold text-falla-ink/40 max-w-xl mx-auto leading-relaxed">
            The official program is subject to changes based on weather and city safety
            protocols. Times are indicative of the main celebration start.
          </p>
        </div>
      </div>
    </div>
  );
}
