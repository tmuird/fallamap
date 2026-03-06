import { motion } from "framer-motion";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Clock, MapPin, Flame, Music, Camera } from "lucide-react";

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
    <div className="min-h-screen bg-background py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 italic">
            Festival <span className="falla-text-gradient">Timeline</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-lg mx-auto">
            Don't miss a single spark. Here are the must-see events for Fallas 2026.
          </p>
        </motion.div>

        <div className="relative border-l-2 border-primary/20 ml-4 md:ml-0 md:pl-0">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-12 relative pl-10 md:pl-0"
            >
              {/* Dot on the line */}
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(255,107,0,0.5)] z-10" />
              
              <div className="md:grid md:grid-cols-12 gap-8 items-start">
                {/* Date/Time Column */}
                <div className="md:col-span-3 mb-2 md:mb-0 md:text-right">
                  <p className="text-primary font-black uppercase tracking-tighter text-xl">{event.date}</p>
                  <div className="flex items-center md:justify-end gap-1 text-muted-foreground font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="md:col-span-9">
                  <Card className="border-none bg-muted/30 backdrop-blur-sm hover:bg-muted/50 transition-colors shadow-none">
                    <CardBody className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl bg-${event.color}/10 text-${event.color}`}>
                            {event.icon}
                          </div>
                          <h3 className="text-2xl font-black uppercase tracking-tight">{event.title}</h3>
                        </div>
                        <Chip variant="flat" color={event.color as any} className="font-bold uppercase text-[10px]">
                          {event.type}
                        </Chip>
                      </div>
                      
                      <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground opacity-60">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                        <Button size="sm" variant="flat" color="primary" className="font-bold uppercase tracking-tighter">
                          Remind Me
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
