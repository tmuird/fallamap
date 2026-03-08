import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@heroui/react";
import { Clock, MapPin, Flame, MusicNotes, Camera, Bell } from "@phosphor-icons/react";
import { TracingBeam } from "@/components/ui/tracing-beam";

const events = [
  {
    date: "March 1 - 19",
    time: "14:00",
    title: "La Mascletà",
    location: "Plaça de l'Ajuntament",
    description: "The daily rhythmic explosion of firecrackers that shakes the ground and the hearts of València.",
    type: "Daily",
    icon: <Flame size={24} weight="bold" />,
    color: "danger"
  },
  {
    date: "March 15 - 16",
    time: "00:00",
    title: "La Plantà",
    location: "All over the city",
    description: "The moment when the monuments are finally finished and erected in the streets.",
    type: "Major",
    icon: <Camera size={24} weight="bold" />,
    color: "primary"
  },
  {
    date: "March 17 - 18",
    time: "15:30",
    title: "L'Ofrena",
    location: "Plaça de la Mare de Déu",
    description: "A two-day procession of thousands of Fallers offering flowers to the Mare de Déu.",
    type: "Procession",
    icon: <MusicNotes size={24} weight="bold" />,
    color: "secondary"
  },
  {
    date: "March 18",
    time: "01:30",
    title: "Nit del Foc",
    location: "Jardí del Túria",
    description: "The biggest fireworks display of the festival, illuminating the night sky.",
    type: "Night",
    icon: <Flame size={24} weight="bold" />,
    color: "warning"
  },
  {
    date: "March 19",
    time: "22:00",
    title: "La Cremà",
    location: "Every corner of València",
    description: "The dramatic burning of all monuments, marking the end of the festival and the birth of spring.",
    type: "The Finale",
    icon: <Flame size={24} weight="bold" />,
    color: "danger"
  }
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-falla-paper py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto antialiased relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-32"
        >
          <div className="brutal-pill inline-block mb-6 bg-falla-paper border-falla-ink/20 shadow-none px-4 py-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">The Agenda</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display text-falla-ink mb-6 leading-tight tracking-normal italic lowercase">
            festival timeline
          </h1>
          <p className="text-falla-ink/60 font-medium text-lg md:text-xl max-w-lg mx-auto tracking-normal">
            Discover the must-see events for the 2026 Falles season.
          </p>
        </motion.div>

        <TracingBeam>
          <div className="space-y-32 pb-32">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className={cn(
                  "relative flex flex-col md:flex-row items-center justify-between w-full gap-12 md:gap-0",
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Dot indicator - perfectly centered on desktop line */}
                <div className="absolute left-[-9px] md:left-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-falla-paper border-[3px] border-falla-fire shadow-solid md:-translate-x-1/2 z-30" />
                
                {/* Content Card Side */}
                <div className="w-full md:w-[42%] relative z-20">
                  <Card className="hover:translate-y-[-4px] transition-all duration-300 bg-falla-paper border-2">
                    <CardBody className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <p className="text-falla-fire font-black uppercase tracking-widest text-2xl">{event.date}</p>
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
                        <h3 className="text-3xl md:text-4xl font-display text-falla-ink leading-tight italic lowercase">{event.title}</h3>
                      </div>
                      
                      <p className="text-falla-ink/70 font-medium leading-relaxed mb-10 text-base text-left">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between pt-8 border-t-2 border-falla-ink/5 gap-4">
                        <div className="flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-falla-ink/30 tracking-widest">
                            <Clock size={14} weight="bold" /> {event.time}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-falla-ink">
                            <MapPin size={16} weight="bold" className="text-falla-fire" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-11 px-6 rounded-2xl border-2 text-falla-ink"
                          startContent={<Bell size={16} weight="bold" />}
                        >
                          Remind Me
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Empty side for desktop spacing */}
                <div className="hidden md:block md:w-[42%]" />
              </motion.div>
            ))}
          </div>
        </TracingBeam>
      </div>
    </div>
  );
}
