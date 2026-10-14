import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Chip, type ChipProps } from "@heroui/react";
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
  BookmarkSimple,
} from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { useUser } from "@clerk/react";
import { useCommunityContent } from "@/lib/hooks/useCommunityContent";
import { validatePhotoFile, uploadCommunityPhoto, PHOTO_ACCEPT } from "@/lib/photoUpload";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { schedule, type ScheduleEvent } from "@/lib/eventData";
import { SITE } from "@/lib/siteConfig";
import { getSavedEventStorageKey, buildSavedEventGroups, readSavedEventIdsFromStorage, toggleSavedEventInStorage } from "@/lib/savedEvents";
import { buildIcsCalendar, buildIcsPlanQuery, parseIcsPlanIds } from "@/lib/ics";

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

/** Turn generated calendar text into a download the browser saves. */
function downloadIcs(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ICS_OPTIONS = {
  prodId: SITE.brand.icsProdId,
  timeZone: SITE.countdown.timeZone,
  calendarName: SITE.event.name,
  slug: SITE.event.fileSlug,
} as const;

/** Build the ICS payload for one event on the given day. */
function buildEventIcs(event: ScheduleEvent, dayDate: string, pageUrl: string) {
  return buildIcsCalendar(
    [{ ...event, date: dayDate }],
    { ...ICS_OPTIONS, url: pageUrl }
  );
}

/** Build one calendar containing every event in the user's plan. */
function buildPlanIcs(dayGroups: Array<{ date: string; events: ScheduleEvent[] }>) {
  const events = dayGroups.flatMap((day) =>
    day.events.map((event) => ({ ...event, date: day.date }))
  );
  return buildIcsCalendar(events, ICS_OPTIONS);
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
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    const invalid = validatePhotoFile(file);
    if (invalid) {
      toast.error(invalid);
      input.value = "";
      return;
    }
    if (!user) {
      toast.error("Please sign in to upload photos", {
        action: { label: "Join", onClick: () => navigate("/sign-up") },
      });
      input.value = "";
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading photo...");
    const result = await uploadCommunityPhoto(file, {
      folder: "event-images",
      namePrefix: event.id,
      storage: supabase.storage,
      saveRow: (url) => addImage(url, user.id, false),
    });
    setUploading(false);
    input.value = "";
    if (result.ok) {
      toast.success("Photo shared — awaiting review", { id: toastId });
    } else {
      toast.error(result.message, { id: toastId });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/schedule?day=${schedule.find((d) =>
      d.events.some((e) => e.id === event.id)
    )?.id}&event=${event.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${event.title} – ${SITE.event.name}`, text: event.description, url });
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!", { description: url });
    }
  };

  const handleAddToCalendar = () => {
    downloadIcs(
      `${event.title.replace(/\s+/g, "-")}-${SITE.event.fileSlug}.ics`,
      buildEventIcs(event, dayDate, window.location.href)
    );
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
              <Camera size={24} weight="bold" className="text-falla-fire-ink" />
              <h3 className="text-2xl font-display lowercase">
                Photo Stream
                {images.length > 0 && (
                  <span className="ml-2 text-sm font-sans font-black text-falla-ink/65">
                    {images.length}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={PHOTO_ACCEPT}
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
                      onClick={() => toggleImageLike(img.id as string)}
                      className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white transition-all hover:scale-110 active:scale-95"
                    >
                      <Heart
                        size={14}
                        weight={img.likeCount > 0 ? "fill" : "bold"}
                        className={img.likeCount > 0 ? "text-falla-like" : "text-white"}
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
                    className="text-falla-ink/65 mb-2 group-hover:scale-110 transition-transform"
                  />
                  <p className="text-[9px] font-black uppercase text-falla-ink/65 tracking-widest">
                    Be first to share
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="p-8 rounded-[2.5rem] bg-falla-fire/5 border-2 border-falla-fire/10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-falla-fire flex items-center justify-center text-falla-on-fire shadow-solid-sm shrink-0">
              <TrendUp size={32} weight="bold" />
            </div>
            <div>
              <h4 className="text-lg font-display lowercase leading-none mb-1">
                Trending now
              </h4>
              <p className="text-xs font-medium text-falla-ink/65 leading-relaxed">
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
                  <span className="ml-2 text-sm font-sans font-black text-falla-ink/65">
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-falla-fire-ink">
                          {c.user_id ? "Community" : "Anonymous"}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-falla-ink/65">
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
            <div className="flex items-center gap-2 px-2 text-[9px] font-black uppercase tracking-widest text-falla-ink/65">
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
                className="flex-1 bg-falla-paper border-2 border-falla-ink rounded-xl px-5 py-3 text-sm font-bold placeholder:text-falla-ink/65 focus:outline-none focus:border-falla-fire transition-all disabled:opacity-50"
              />
              <Button
                isIconOnly
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || !isSignedIn}
                className="w-12 h-12 bg-falla-fire text-falla-on-fire border-2 border-falla-ink shadow-solid hover:shadow-none transition-all rounded-xl shrink-0"
              >
                <PaperPlaneRight size={20} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer utils */}
      <div className="mt-16 flex flex-wrap gap-4 border-t-2 border-falla-ink/5 pt-12">
        <Button
          onClick={handleAddToCalendar}
          className="h-14 min-w-[200px] flex-1 rounded-xl border-2 border-falla-ink bg-falla-fire text-falla-on-fire shadow-solid transition-all hover:shadow-none"
          startContent={<CalendarPlus size={20} weight="bold" />}
        >
          Add to Calendar
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="h-14 min-w-[200px] flex-1 rounded-xl border-2 shadow-solid transition-all hover:shadow-none"
          startContent={<ShareNetwork size={20} weight="bold" />}
        >
          Share Event
        </Button>
      </div>
    </PhotoProvider>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const SAVED_EVENT_STORAGE_KEY = getSavedEventStorageKey(SITE.event.fileSlug);
const ALL_SCHEDULE_EVENT_IDS = schedule.flatMap((day) => day.events.map((event) => event.id));

export default function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDayId, setSelectedDayId] = useState(
    searchParams.get("day") || "mar-19"
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMyPlan, setShowMyPlan] = useState(false);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    try {
      return readSavedEventIdsFromStorage(window.localStorage, SITE.event.fileSlug, ALL_SCHEDULE_EVENT_IDS);
    } catch {
      return [];
    }
  });

  const currentDay = useMemo(
    () => schedule.find((d) => d.id === selectedDayId),
    [selectedDayId]
  );

  const selectedEvent = useMemo(() => {
    const eventId = searchParams.get("event");
    if (!eventId) return null;
    for (const day of schedule) {
      const found = day.events.find((e) => e.id === eventId);
      if (found) return { ...found, dayDate: day.date, dayId: day.id };
    }
    return null;
  }, [searchParams]);

  const savedDayGroups = useMemo(
    () => buildSavedEventGroups<ScheduleEvent, (typeof schedule)[number]>(schedule, savedEventIds),
    [savedEventIds]
  );
  const visibleDayGroups = showMyPlan
    ? savedDayGroups
    : currentDay ? [currentDay] : [];

  useEffect(() => {
    const syncSavedEvents = (event: StorageEvent) => {
      const itemKeyPrefix = `${SAVED_EVENT_STORAGE_KEY}:item:`;
      if (event.key === null || event.key?.startsWith(itemKeyPrefix)) {
        try {
          setSavedEventIds(readSavedEventIdsFromStorage(window.localStorage, SITE.event.fileSlug, ALL_SCHEDULE_EVENT_IDS));
        } catch {
          // Storage may be unavailable in restricted browser contexts.
        }
      }
    };
    window.addEventListener("storage", syncSavedEvents);
    return () => window.removeEventListener("storage", syncSavedEvents);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(!!selectedEvent);
  }, [selectedEvent]);

  // Arriving from someone else's shared plan link: open the plan view so the
  // "add these events" prompt is visible straight away.
  useEffect(() => {
    if (parseIcsPlanIds(window.location.search, ALL_SCHEDULE_EVENT_IDS).length > 0) {
      setShowMyPlan(true);
    }
  }, []);

  const handleToggleSaved = (eventId: string) => {
    try {
      const result = toggleSavedEventInStorage(
        window.localStorage,
        SITE.event.fileSlug,
        ALL_SCHEDULE_EVENT_IDS,
        eventId
      );
      setSavedEventIds(result.savedIds);
      toast.success(result.saved ? "Added to My Plan" : "Removed from My Plan");
    } catch {
      toast.error("Couldn't save your plan on this device.");
    }
  };

  // A shared ?plan= link carries event ids; we only offer ones this deployment knows.
  const sharedPlanIds = useMemo(
    () => parseIcsPlanIds(window.location.search, ALL_SCHEDULE_EVENT_IDS),
    []
  );
  const [dismissedSharedPlan, setDismissedSharedPlan] = useState(false);
  const unsavedSharedPlanIds = useMemo(
    () => sharedPlanIds.filter((id) => !savedEventIds.includes(id)),
    [sharedPlanIds, savedEventIds]
  );

  const handleAddSharedPlan = () => {
    try {
      for (const eventId of unsavedSharedPlanIds) {
        toggleSavedEventInStorage(
          window.localStorage,
          SITE.event.fileSlug,
          ALL_SCHEDULE_EVENT_IDS,
          eventId
        );
      }
      setSavedEventIds(
        readSavedEventIdsFromStorage(window.localStorage, SITE.event.fileSlug, ALL_SCHEDULE_EVENT_IDS)
      );
      setShowMyPlan(true);
      toast.success(`Added ${unsavedSharedPlanIds.length} events to My Plan`);
    } catch {
      toast.error("Couldn't save your plan on this device.");
    }
  };

  const handleDownloadPlan = () => {
    if (savedDayGroups.length === 0) return;
    downloadIcs(`my-plan-${SITE.event.fileSlug}.ics`, buildPlanIcs(savedDayGroups));
    toast.success("Plan downloaded!", {
      description: `${savedEventIds.length} events — open the file to add them to your calendar.`,
    });
  };

  const handleCopyPlanLink = async () => {
    const url = `${window.location.origin}/schedule?plan=${buildIcsPlanQuery(savedEventIds)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied!", {
        description: "Anyone opening it can add these events to their own plan.",
      });
    } catch {
      toast.info("Copy this link", { description: url });
    }
  };

  const handleEventClick = (event: ScheduleEvent, dayId = selectedDayId) => {
    setSelectedDayId(dayId);
    setSearchParams({ day: dayId, event: event.id });
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSearchParams({ day: selectedDayId });
  };

  const handleDayChange = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowMyPlan(false);
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire-ink flex items-center gap-2">
              <CalendarBlank size={14} weight="bold" /> {showMyPlan ? "Your saved itinerary" : "The Official Program"}
            </span>
          </div>
          <h1 className="text-4xl md:text-8xl font-display text-falla-ink mb-6 leading-[0.85] lowercase">
            {showMyPlan ? "your event plan" : "festival timeline"}
          </h1>
        </motion.div>

        <div className="mb-4 flex justify-center">
          <div role="group" aria-label="Schedule view" className="inline-flex gap-1 rounded-full border-2 border-falla-ink bg-falla-sand/20 p-1 shadow-solid-sm">
            <button
              type="button"
              aria-pressed={!showMyPlan}
              onClick={() => setShowMyPlan(false)}
              className={cn(
                "rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                !showMyPlan ? "bg-falla-ink text-falla-paper" : "text-falla-ink/65 hover:text-falla-ink"
              )}
            >
              Program
            </button>
            <button
              type="button"
              aria-pressed={showMyPlan}
              onClick={() => setShowMyPlan(true)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                showMyPlan ? "bg-falla-fire text-falla-on-fire" : "text-falla-ink/65 hover:text-falla-ink"
              )}
            >
              <BookmarkSimple size={14} weight={showMyPlan ? "fill" : "bold"} />
              My Plan <span className="tabular-nums">{savedEventIds.length}</span>
            </button>
          </div>
        </div>

        {/* Sticky day selector */}
        {!showMyPlan && (
          <div className="sticky top-24 md:top-36 z-40 mb-16 py-4 bg-falla-paper/80 backdrop-blur-md flex justify-center">
            <div className="flex bg-falla-sand/20 p-1.5 rounded-[2rem] border-2 border-falla-ink shadow-solid-sm overflow-x-auto scrollbar-hide max-w-full">
              {schedule.map((day) => (
                <button
                key={day.id}
                onClick={() => handleDayChange(day.id)}
                className={cn(
                  "px-6 md:px-10 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedDayId === day.id
                    ? "bg-falla-fire text-falla-on-fire shadow-solid-sm border-2 border-falla-ink translate-y-[-2px]"
                    : "text-falla-ink/65 hover:text-falla-ink"
                )}
              >
                {day.day}
              </button>
              ))}
            </div>
          </div>
        )}

        {/* My Plan actions — export, share, and accept a shared plan */}
        {showMyPlan && (
          <div className="ml-12 md:ml-20 mb-10 space-y-4">
            {sharedPlanIds.length > 0 && unsavedSharedPlanIds.length > 0 && !dismissedSharedPlan && (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-falla-ink bg-falla-sand/20 p-5"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-fire-ink">
                    Shared plan
                  </p>
                  <p className="mt-1 text-sm font-semibold text-falla-ink">
                    This link carries {unsavedSharedPlanIds.length}{" "}
                    {unsavedSharedPlanIds.length === 1 ? "event" : "events"}. Add them to your plan?
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleAddSharedPlan}
                    className="rounded-xl border-2 border-falla-ink shadow-solid hover:shadow-none"
                  >
                    Add to My Plan
                  </Button>
                  <button
                    onClick={() => setDismissedSharedPlan(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-falla-ink/65 underline underline-offset-4 hover:text-falla-ink"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}

            {savedEventIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-falla-ink/10 bg-falla-paper/60 p-5">
                <p className="text-sm font-semibold text-falla-ink/65">
                  <span className="tabular-nums">{savedEventIds.length}</span>{" "}
                  {savedEventIds.length === 1 ? "event" : "events"} · kept in this browser on this device
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleDownloadPlan}
                    startContent={<CalendarPlus size={18} weight="bold" />}
                    className="rounded-xl border-2 border-falla-ink shadow-solid hover:shadow-none"
                  >
                    Download calendar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyPlanLink}
                    startContent={<ShareNetwork size={18} weight="bold" />}
                    className="rounded-xl border-2 shadow-solid hover:shadow-none"
                  >
                    Copy share link
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

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

          {showMyPlan && visibleDayGroups.length === 0 ? (
            <div className="ml-12 md:ml-20 rounded-2xl border-2 border-dashed border-falla-ink/20 bg-falla-sand/10 p-7 md:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-fire-ink">A plan of your own</p>
              <h2 className="mt-3 text-2xl font-display lowercase text-falla-ink">Nothing saved yet</h2>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-falla-ink/65">
                Open any event and choose “Add to My Plan”. Your picks stay in this browser on this device.
              </p>
              <Button
                variant="outline"
                className="mt-5 rounded-xl border-2 shadow-solid hover:shadow-none"
                onClick={() => setShowMyPlan(false)}
              >
                Browse the program
              </Button>
            </div>
          ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={showMyPlan ? "my-plan" : selectedDayId}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {visibleDayGroups.map((dayGroup) => (
                <div key={dayGroup.id} className="space-y-4">
                  <div className="ml-16 md:ml-28 mb-10 flex items-center gap-4">
                    <h2 className="text-3xl font-display text-falla-fire-ink lowercase leading-none">
                      {dayGroup.subtitle}
                    </h2>
                    <div className="h-[2px] flex-1 bg-falla-ink/5" />
                  </div>

                  {dayGroup.events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.03 }}
                      className="relative group"
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

                      <div className="ml-12 md:ml-20 flex items-center gap-2 rounded-2xl border-b-2 border-falla-ink/5 transition-colors hover:bg-falla-sand/5">
                        <button
                          type="button"
                          onClick={() => handleEventClick(event, dayGroup.id)}
                          aria-label={`View details for ${event.title}`}
                          className="flex min-w-0 flex-1 items-center gap-6 rounded-2xl px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-falla-fire md:px-8"
                        >
                          <div className="w-16 shrink-0 md:w-24">
                            <span className="text-xl font-black text-falla-ink/65 transition-colors group-hover:text-falla-ink md:text-2xl">
                              {event.time}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-3">
                              <h3 className="truncate text-xl font-display leading-tight lowercase text-falla-ink transition-colors group-hover:text-falla-fire-ink md:text-3xl">
                                {event.title}
                              </h3>
                              {event.isLive && (
                                <span className="flex items-center gap-1.5 rounded-md border border-falla-fire/20 bg-falla-fire/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-falla-fire-ink">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-falla-fire" />
                                  Live
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-falla-ink/65">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <MapPin size={12} weight="bold" />
                                <span className="truncate">{event.location}</span>
                              </div>
                              <div className="hidden items-center gap-1.5 sm:flex">
                                <div className="h-1 w-1 rounded-full bg-falla-ink/20" />
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={event.color as ChipProps["color"]}
                                  className="h-5 border border-current/10 px-2 text-[8px] font-black uppercase tracking-widest"
                                >
                                  {event.type}
                                </Chip>
                              </div>
                            </div>
                          </div>

                          <CaretRight size={24} weight="bold" className="shrink-0 text-falla-fire-ink opacity-40 transition-opacity group-hover:opacity-100" />
                        </button>

                        <Button
                          type="button"
                          isIconOnly
                          variant="ghost"
                          aria-label={savedEventIds.includes(event.id) ? `Remove ${event.title} from My Plan` : `Add ${event.title} to My Plan`}
                          aria-pressed={savedEventIds.includes(event.id)}
                          title={savedEventIds.includes(event.id) ? "Remove from My Plan" : "Add to My Plan"}
                          className="mr-3 h-9 w-9 shrink-0 text-falla-fire-ink hover:bg-falla-fire/10"
                          onClick={() => handleToggleSaved(event.id)}
                        >
                          <BookmarkSimple size={18} weight={savedEventIds.includes(event.id) ? "fill" : "bold"} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          )}
        </div>

        {/* Event detail drawer */}
        <Drawer.Root
          open={isDrawerOpen}
          onOpenChange={(open) => !open && handleDrawerClose()}
        >
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
            <Drawer.Content className="bg-transparent flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none items-center">
              <Drawer.Title className="sr-only">{selectedEvent?.title ?? "Event details"}</Drawer.Title>
              <Drawer.Description className="sr-only">
                {selectedEvent?.description ?? "Details for this schedule event."}
              </Drawer.Description>
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
                            <span className="text-[10px] font-black uppercase text-falla-fire-ink tracking-widest">
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
                            color={selectedEvent.color as ChipProps["color"]}
                            className="font-black text-[10px] uppercase tracking-[0.2em] px-4 h-8 border-2 border-current/10"
                          >
                            {selectedEvent.type}
                          </Chip>
                          <div className="flex items-center gap-2 px-5 py-2 bg-falla-sand/20 rounded-full border-2 border-falla-ink/5">
                            <MapPin size={18} weight="bold" className="text-falla-fire-ink" />
                            <span className="text-xs font-bold text-falla-ink uppercase tracking-widest">
                              {selectedEvent.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xl md:text-2xl font-medium leading-tight text-falla-ink/65 max-w-3xl">
                        {selectedEvent.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => handleToggleSaved(selectedEvent.id)}
                          variant="outline"
                          className={cn(
                            "h-12 rounded-xl border-2 shadow-solid transition-all hover:shadow-none",
                            savedEventIds.includes(selectedEvent.id) && "bg-falla-fire text-falla-on-fire"
                          )}
                          startContent={<BookmarkSimple size={18} weight={savedEventIds.includes(selectedEvent.id) ? "fill" : "bold"} />}
                          aria-pressed={savedEventIds.includes(selectedEvent.id)}
                        >
                          {savedEventIds.includes(selectedEvent.id) ? "Remove from My Plan" : "Add to My Plan"}
                        </Button>
                        <span className="text-xs font-semibold text-falla-ink/65">
                          Saved privately on this device.
                        </span>
                      </div>
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
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-falla-ink/65 mb-3 italic">
            "Senyor pirotècnic, pot començar la mascletà!"
          </p>
          <p className="text-xs font-bold text-falla-ink/65 max-w-xl mx-auto leading-relaxed">
            The official program is subject to changes based on weather and city safety
            protocols. Times are indicative of the main celebration start.
          </p>
        </div>
      </div>
    </div>
  );
}
