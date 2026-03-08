import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Chip } from "@heroui/react";
import { 
  MapPin, 
  Flame, 
  MusicNotes, 
  Bell, 
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
  NavigationArrow
} from "@phosphor-icons/react";
import { Drawer } from "vaul";

const scheduleData = [
  {
    id: "mar-14",
    day: "Sat 14",
    subtitle: "The Weekend Begins",
    events: [
      {
        id: "mascleta-14",
        time: "14:00",
        title: "Mascletà",
        location: "Plaça de l'Ajuntament",
        description: "The daily explosion of gunpowder. Today featuring Pirotècnia Aitana with 'La belleza del sonido'.",
        type: "Pyrotechnics",
        icon: <Flame size={24} weight="bold" />,
        color: "danger",
        discussionCount: 45,
        photoCount: 22
      },
      {
        id: "ninot-indultat-infantil",
        time: "17:30",
        title: "Infant Ninot Indultat",
        location: "Exposición del Ninot",
        description: "Official proclamation of the one children's figure saved from the flames by popular vote.",
        type: "Major",
        icon: <Trophy size={24} weight="bold" />,
        color: "primary",
        discussionCount: 12,
        photoCount: 34
      },
      {
        id: "pyro-spectacle-14",
        time: "23:59",
        title: "Night Pyro Show",
        location: "Plaza del Ayuntamiento",
        description: "'Falles, llum i soroll' by Pirotècnia Tamarit. A combination of light and noise.",
        type: "Fireworks",
        icon: <Sparkle size={24} weight="bold" />,
        color: "warning",
        discussionCount: 28,
        photoCount: 19
      }
    ]
  },
  {
    id: "mar-15",
    day: "Sun 15",
    subtitle: "La Plantà Infantil",
    events: [
      {
        id: "planta-infantil",
        time: "09:00",
        title: "Children's Plantà",
        location: "Everywhere",
        description: "Commissions across the city assemble their children's monuments. The festival officially begins in the streets.",
        type: "Major",
        icon: <Camera size={24} weight="bold" />,
        color: "primary",
        discussionCount: 24,
        photoCount: 156
      },
      {
        id: "mascleta-15",
        time: "14:00",
        title: "Mascletà",
        location: "Plaça de l'Ajuntament",
        description: "By Pirotècnia Valenciana. Expect massive crowds for this Sunday display.",
        type: "Pyrotechnics",
        icon: <Flame size={24} weight="bold" />,
        color: "danger",
        discussionCount: 189,
        photoCount: 92
      },
      {
        id: "ninot-indultat",
        time: "17:30",
        title: "Ninot Indultat 2026",
        location: "Museum of Sciences",
        description: "The final verdict. One main ninot will be saved from the fire and move to the Fallero Museum.",
        type: "Major",
        icon: <Trophy size={24} weight="bold" />,
        color: "primary",
        discussionCount: 56,
        photoCount: 12
      },
      {
        id: "alba-falles",
        time: "23:59",
        title: "L'Alba de les Falles",
        location: "City-wide",
        description: "A synchronized firework display across all commissions. Today by Pirotècnia Vulcano at the Town Hall.",
        type: "Fireworks",
        icon: <Sparkle size={24} weight="bold" />,
        color: "warning",
        discussionCount: 67,
        photoCount: 112
      }
    ]
  },
  {
    id: "mar-16",
    day: "Mon 16",
    subtitle: "The Main Plantà",
    events: [
      {
        id: "planta-main",
        time: "08:00",
        title: "The Main Plantà",
        location: "Valencia Streets",
        description: "The deadline for all major monuments to be fully erected. The city is now an open-air museum.",
        type: "Major",
        icon: <NavigationArrow size={24} weight="bold" />,
        color: "primary",
        discussionCount: 12,
        photoCount: 89
      },
      {
        id: "awards-infantil",
        time: "16:30",
        title: "Children's Awards",
        location: "Plaza del Ayuntamiento",
        description: "Ceremony for the best children's monuments in all sections.",
        type: "Ceremony",
        icon: <Trophy size={24} weight="bold" />,
        color: "secondary",
        discussionCount: 15,
        photoCount: 22
      },
      {
        id: "castillo-16",
        time: "23:59",
        title: "Fireworks Display",
        location: "Monteolivete Bridge",
        description: "Grand midnight fireworks display lighting up the City of Arts and Sciences.",
        type: "Fireworks",
        icon: <Sparkle size={24} weight="bold" />,
        color: "warning",
        discussionCount: 34,
        photoCount: 56
      }
    ]
  },
  {
    id: "mar-17",
    day: "Tue 17",
    subtitle: "L'Ofrena Day 1",
    events: [
      {
        id: "awards-main",
        time: "09:00",
        title: "Awards Ceremony",
        location: "Town Hall",
        description: "The highly anticipated awards for the main falla monuments and illuminated streets.",
        type: "Ceremony",
        icon: <Trophy size={24} weight="bold" />,
        color: "secondary",
        discussionCount: 45,
        photoCount: 23
      },
      {
        id: "ofrena-day-1",
        time: "15:30",
        title: "Ofrena de Flors",
        location: "Plaza de la Virgen",
        description: "Day one of the offering. Thousands of falleros bring carnations to build the Virgin's flower mantle.",
        type: "Procession",
        icon: <MusicNotes size={24} weight="bold" />,
        color: "secondary",
        discussionCount: 120,
        photoCount: 450
      },
      {
        id: "castillo-17",
        time: "23:59",
        title: "Fireworks Display",
        location: "Monteolivete Bridge",
        description: "A spectacular night of light and sound.",
        type: "Fireworks",
        icon: <Sparkle size={24} weight="bold" />,
        color: "warning",
        discussionCount: 23,
        photoCount: 41
      }
    ]
  },
  {
    id: "mar-18",
    day: "Wed 18",
    subtitle: "The Night of Fire",
    events: [
      {
        id: "ofrena-day-2",
        time: "15:30",
        title: "Ofrena de Flors",
        location: "Plaza de la Virgen",
        description: "Conclusion of the offering with the arrival of the Fallera Mayor de Valencia.",
        type: "Procession",
        icon: <MusicNotes size={24} weight="bold" />,
        color: "secondary",
        discussionCount: 340,
        photoCount: 890
      },
      {
        id: "nit-del-foc",
        time: "23:59",
        title: "Nit del Foc",
        location: "Monteolivete",
        description: "The biggest and most spectacular fireworks display of the year. A must-see.",
        type: "Fireworks",
        icon: <Sparkle size={24} weight="bold" />,
        color: "warning",
        discussionCount: 560,
        photoCount: 1200
      }
    ]
  },
  {
    id: "mar-19",
    day: "Thu 19",
    subtitle: "La Cremà",
    events: [
      {
        id: "mascleta-final",
        time: "14:00",
        title: "Grand Mascletà",
        location: "Plaça de l'Ajuntament",
        description: "The final explosion of the festival. Today by Pirotècnia Hnos Caballer.",
        type: "Pyrotechnics",
        icon: <Flame size={24} weight="bold" />,
        color: "danger",
        discussionCount: 567,
        photoCount: 234,
        isLive: true
      },
      {
        id: "fire-parade",
        time: "19:00",
        title: "Cavalcada del Foc",
        location: "Calle de la Paz",
        description: "A parade of fire celebrating the element that will soon consume the monuments.",
        type: "Parade",
        icon: <Fire size={24} weight="bold" />,
        color: "warning",
        discussionCount: 88,
        photoCount: 41
      },
      {
        id: "crema-infantil-muni",
        time: "21:00",
        title: "Children's Cremà",
        location: "Plaza del Ayuntamiento",
        description: "The burning of the Municipal children's monument.",
        type: "The Burning",
        icon: <Flame size={24} weight="bold" />,
        color: "danger",
        discussionCount: 210,
        photoCount: 112
      },
      {
        id: "crema-general",
        time: "22:00",
        title: "Main Cremà",
        location: "Every corner",
        description: "The simultaneous burning of all main falla monuments in the city.",
        type: "The Burning",
        icon: <Flame size={24} weight="bold" />,
        color: "danger",
        discussionCount: 432,
        photoCount: 189
      },
      {
        id: "crema-muni",
        time: "23:00",
        title: "Municipal Cremà",
        location: "Plaza del Ayuntamiento",
        description: "The final act. The burning of the giant municipal falla marks the end of the festival.",
        type: "The Burning",
        icon: <Flame size={24} weight="bold" />,
        color: "danger",
        discussionCount: 890,
        photoCount: 456
      }
    ]
  }
];

export default function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDayId, setSelectedDayId] = useState(searchParams.get("day") || "mar-19");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentDay = useMemo(() => 
    scheduleData.find(d => d.id === selectedDayId), 
    [selectedDayId]
  );

  const selectedEvent = useMemo(() => {
    const eventId = searchParams.get("event");
    if (!eventId) return null;
    for (const day of scheduleData) {
      const found = day.events.find(e => e.id === eventId);
      if (found) return found;
    }
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (selectedEvent) {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
    }
  }, [selectedEvent]);

  const handleEventClick = (event: any) => {
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
    <div className="min-h-screen bg-falla-paper pt-32 pb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto antialiased relative">
        {/* Header Section */}
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

        {/* Sticky Day Selector - The "Postage Stamp" Bar */}
        <div className="sticky top-20 z-40 mb-16 py-4 bg-falla-paper/80 backdrop-blur-md flex justify-center">
          <div className="flex bg-falla-sand/20 p-1.5 rounded-[2rem] border-2 border-falla-ink shadow-solid-sm overflow-x-auto scrollbar-hide max-w-full">
            {scheduleData.map((day) => (
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

        {/* Timeline View */}
        <div className="relative">
          {/* Enhanced Vertical Tracing Line */}
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
                  {/* Timeline Node - The "Dot" */}
                  <motion.div 
                    layoutId={`node-${event.id}`}
                    className="absolute left-[13px] md:left-[37px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-falla-paper border-[3px] border-falla-ink flex items-center justify-center z-10 group-hover:scale-125 transition-all duration-300 shadow-solid-sm group-hover:border-falla-fire"
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      event.isLive ? "bg-falla-fire animate-pulse scale-150" : "bg-falla-ink group-hover:bg-falla-fire"
                    )} />
                  </motion.div>

                  {/* Compact Event Row */}
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
                        <div className="hidden sm:flex items-center gap-4">
                          <div className="w-1 h-1 rounded-full bg-falla-ink/20" />
                          <div className="flex items-center gap-1.5 group-hover:text-falla-fire transition-colors">
                            <ChatCircleDots size={12} weight="bold" />
                            {event.discussionCount} Notes
                          </div>
                          <div className="flex items-center gap-1.5 group-hover:text-falla-fire transition-colors">
                            <Camera size={12} weight="bold" />
                            {event.photoCount} Photos
                          </div>
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

        {/* Details Drawer with Community Hub */}
        <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && handleDrawerClose()}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
            <Drawer.Content className="bg-transparent flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none items-center">
              <div className="w-full max-w-5xl bg-falla-paper rounded-t-[3rem] border-x-2 border-t-2 border-falla-ink shadow-solid flex flex-col max-h-[92vh] overflow-hidden">
                {/* Visual Handle */}
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4" />
                
                {selectedEvent && (
                  <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 pt-4 scrollbar-hide overscroll-contain">
                    <header className="flex flex-col gap-6 mb-16 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-falla-ink text-falla-paper flex items-center justify-center shadow-solid-sm">
                            {selectedEvent.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-3xl font-black text-falla-ink">{selectedEvent.time}</span>
                            <span className="text-[10px] font-black uppercase text-falla-fire tracking-widest">Central European Time</span>
                          </div>
                        </div>
                        <Button isIconOnly variant="neutral" className="w-12 h-12 rounded-full border-2 bg-falla-paper" onClick={handleDrawerClose}>
                          <X size={24} weight="bold" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-5xl md:text-8xl font-display text-falla-ink leading-[0.8] lowercase">
                          {selectedEvent.title}
                        </h2>
                        <div className="flex flex-wrap gap-3 items-center">
                          <Chip variant="flat" color={selectedEvent.color as any} className="font-black text-[10px] uppercase tracking-[0.2em] px-4 h-8 border-2 border-current/10">
                            {selectedEvent.type}
                          </Chip>
                          <div className="flex items-center gap-2 px-5 py-2 bg-falla-sand/20 rounded-full border-2 border-falla-ink/5">
                            <MapPin size={18} weight="bold" className="text-falla-fire" />
                            <span className="text-xs font-bold text-falla-ink uppercase tracking-widest">{selectedEvent.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xl md:text-2xl font-medium leading-tight text-falla-ink/60 max-w-3xl">
                        {selectedEvent.description}
                      </p>
                    </header>

                    {/* Community Hub Implementation */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-2 border-falla-ink/5 pt-12">
                      {/* Left: Photos & Gallery */}
                      <div className="lg:col-span-7 space-y-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Camera size={24} weight="bold" className="text-falla-fire" />
                            <h3 className="text-2xl font-display lowercase">Photo Stream</h3>
                          </div>
                          <Button size="sm" variant="outline" className="h-10 px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest" startContent={<Camera size={16} weight="bold" />}>
                            Post Photo
                          </Button>
                        </div>

                        {/* Live Photo Stream (Mock) */}
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-falla-sand/20 rounded-3xl border-2 border-dashed border-falla-ink/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-falla-sand/30 transition-all cursor-pointer">
                              <Camera size={24} weight="thin" className="text-falla-ink/20 mb-2 group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] font-black uppercase text-falla-ink/20 tracking-widest">Waiting for uploads</p>
                            </div>
                          ))}
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-falla-fire/5 border-2 border-falla-fire/10 flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-falla-fire flex items-center justify-center text-falla-paper shadow-solid-sm shrink-0">
                            <TrendUp size={32} weight="bold" />
                          </div>
                          <div>
                            <h4 className="text-lg font-display lowercase leading-none mb-1">Trending now</h4>
                            <p className="text-xs font-medium text-falla-ink/60 leading-relaxed">
                              This event is currently generating high community engagement. Share your point of view!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Live Discussion */}
                      <div className="lg:col-span-5 flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ChatCircleDots size={24} weight="bold" className="text-falla-sage" />
                            <h3 className="text-2xl font-display lowercase">Live Notes</h3>
                          </div>
                          <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-falla-sage bg-falla-sage/10 px-2 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-falla-sage animate-pulse" />
                            Active
                          </span>
                        </div>

                        {/* Mock Chat Feed */}
                        <div className="flex-1 space-y-6">
                          {[
                            { user: "Pepita_VLC", text: "The noise is incredible this year! 🧨", time: "2m ago" },
                            { user: "FalleroMayor", text: "Best viewing spot is near the bank corner.", time: "5m ago" },
                            { user: "TouristTom", text: "Is it safe for kids? It's very loud.", time: "12m ago" }
                          ].map((msg, i) => (
                            <div key={i} className="group">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-falla-fire">{msg.user}</span>
                                <span className="text-[9px] font-bold text-falla-ink/20">{msg.time}</span>
                              </div>
                              <div className="p-4 bg-falla-paper border-2 border-falla-ink soft-shadow-sm rounded-2xl group-hover:translate-x-1 transition-all">
                                <p className="text-sm font-medium text-falla-ink">"{msg.text}"</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-6 border-t-2 border-falla-ink/5">
                          <div className="flex gap-3">
                            <input 
                              placeholder="Join the discussion..." 
                              className="flex-1 bg-falla-paper border-2 border-2 border-falla-ink rounded-xl px-5 py-3 text-sm font-bold placeholder:text-falla-ink/20 focus:outline-none focus:border-falla-fire transition-all"
                            />
                            <Button isIconOnly className="w-12 h-12 bg-falla-fire text-falla-paper border-2 border-falla-ink shadow-solid">
                              <CaretRight size={20} weight="bold" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Utils */}
                    <div className="mt-16 flex flex-wrap gap-4 pt-12 border-t-2 border-falla-ink/5">
                      <Button className="flex-1 min-w-[200px] h-14 bg-falla-fire text-falla-paper border-2 border-falla-ink shadow-solid" startContent={<Bell size={20} weight="bold" />}>
                        Get Notification
                      </Button>
                      <Button variant="outline" className="flex-1 min-w-[200px] h-14 rounded-xl border-2 shadow-solid" startContent={<ShareNetwork size={20} weight="bold" />}>
                        Share Event
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        {/* Info Box */}
        <div className="mt-20 p-10 rounded-[2.5rem] bg-falla-sand/10 border-2 border-dashed border-falla-ink/10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-falla-ink/30 mb-3 italic">"Senyor pirotècnic, pot començar la mascletà!"</p>
          <p className="text-xs font-bold text-falla-ink/40 max-w-xl mx-auto leading-relaxed">
            The official program is subject to changes based on weather and city safety protocols. 
            Times are indicative of the main celebration start.
          </p>
        </div>
      </div>
    </div>
  );
}
