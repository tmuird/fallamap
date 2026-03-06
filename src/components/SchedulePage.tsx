import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@heroui/react";
import { Clock, MapPin, Flame, Music, Camera, Bell } from "lucide-react";

const events = [
  {
    date: "March 1 - 19",
    time: "14:00",
    title: "La Mascletà",
    location: "Plaza del Ayuntamiento",
    description: "The daily rhythmic explosion of firecrackers that shakes the ground and the hearts of Valencia.",
    type: "Daily",
    icon: <Flame className="w-5 h-5" />,
    color: "danger"
  },
  {
    date: "March 15 - 16",
    time: "00:00",
    title: "La Plantà",
    location: "All over the city",
    description: "The moment when the monuments are finally finished and erected in the streets.",
    type: "Major",
    icon: <Camera className="w-5 h-5" />,
    color: "primary"
  },
  {
    date: "March 17 - 18",
    time: "15:30",
    title: "Ofrenda de Flores",
    location: "Plaza de la Virgen",
    description: "A two-day procession of thousands of Falleros offering flowers to the Virgin Mary.",
    type: "Procession",
    icon: <Music className="w-5 h-5" />,
    color: "secondary"
  },
  {
    date: "March 18",
    time: "01:30",
    title: "Nit del Foc",
    location: "Turia Gardens",
    description: "The biggest fireworks display of the festival, illuminating the night sky.",
    type: "Night",
    icon: <Flame className="w-5 h-5" />,
    color: "warning"
  },
  {
    date: "March 19",
    time: "22:00",
    title: "La Cremà",
    location: "Every corner of Valencia",
    description: "The dramatic burning of all monuments, marking the end of the festival and the birth of spring.",
    type: "The Finale",
    icon: <Flame className="w-5 h-5" />,
    color: "danger"
  }
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-falla-paper py-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="brutal-pill inline-block mb-6 bg-falla-fire/5 border-falla-fire/20 shadow-none px-4 py-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">The Agenda</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display text-falla-ink mb-6 leading-tight">
            Festival Timeline
          </h1>
          <p className="text-falla-ink/60 font-medium text-lg md:text-xl max-w-lg mx-auto tracking-normal">
            Don't miss a single spark. Here are the must-see events for the 2026 Fallas season.
          </p>
        </motion.div>

        <div className="relative space-y-16">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2.5px] bg-falla-ink/10 md:-translate-x-1/2 hidden md:block" />
          
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className={cn(
                "relative flex flex-col md:flex-row items-center justify-between w-full gap-8",
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Dot on the line */}
              <div className="absolute left-[-9px] md:left-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-falla-paper border-[3px] border-falla-fire shadow-solid md:-translate-x-1/2 z-20" />
              
              {/* Content Card */}
              <div className="w-full md:w-[45%]">
                <Card className="hover:translate-y-[-4px] transition-all duration-300">
                  <CardBody className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-falla-fire font-black uppercase tracking-widest text-xl">{event.date}</p>
                      <Chip 
                        variant="flat" 
                        color={event.color as any} 
                        className="font-black text-[9px] tracking-[0.2em] px-3 border border-current/20 uppercase"
                      >
                        {event.type}
                      </Chip>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-falla-ink text-falla-paper flex items-center justify-center soft-shadow">
                        {event.icon}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-display text-falla-ink leading-tight">{event.title}</h3>
                    </div>
                    
                    <p className="text-falla-ink/70 font-medium leading-relaxed mb-10 text-base">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between pt-8 border-t-2 border-falla-ink/5 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-falla-ink/30 tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-falla-fire" /> {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-falla-ink">
                          <MapPin className="w-4 h-4 text-falla-fire" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-11 px-6 rounded-2xl"
                        startContent={<Bell className="w-4 h-4" />}
                      >
                        Remind Me
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <div className="hidden md:block md:w-[45%]" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
