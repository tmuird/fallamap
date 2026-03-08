import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";
import { Image } from "@heroui/react";
import { Camera, ChatCircleDots, CaretLeft, Trophy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const archiveItems = [
  {
    year: "2025",
    title: "Phoenix Rising",
    description: "A celebration of rebirth and artistic resilience.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
    stats: { photos: 1240, stories: 850 },
    highlights: [
      { number: "1", name: "Convento Jerusalén - Matemático Marzal", reward: "1st Prize" },
      { number: "12", name: "Plaça del Pilar", reward: "2nd Prize" },
      { number: "22", name: "Cuba - Literato Azorín", reward: "3rd Prize" }
    ]
  },
  {
    year: "2024",
    title: "Digital Satire",
    description: "When the streets became a canvas for digital-era Falles.",
    image: "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&q=80&w=800",
    stats: { photos: 980, stories: 420 },
    highlights: [
      { number: "14", name: "Almirante Cadarso - Conde Altea", reward: "1st Prize" },
      { number: "9", name: "Na Jordana", reward: "Popular Vote" }
    ]
  },
  {
    year: "2023",
    title: "Light & Shadow",
    description: "The return of grand monuments after the silent years.",
    image: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?auto=format&fit=crop&q=80&w=800",
    stats: { photos: 2100, stories: 1100 },
    highlights: [
      { number: "1", name: "Exposición - Micer Mascó", reward: "Innovation Award" }
    ]
  }
];

export default function ArchivePage() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const yearData = archiveItems.find(a => a.year === selectedYear);

  return (
    <div className="min-h-screen bg-falla-paper py-12 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedYear ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-center mb-12 md:mb-20">
                <div className="brutal-pill inline-block mb-6 bg-white border-falla-ink/20 shadow-none px-4 py-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire lowercase">history</span>
                </div>
                <h1 className="text-5xl md:text-9xl font-display text-falla-ink mb-6 leading-none italic tracking-tighter lowercase">
                  fallamap archive
                </h1>
                <p className="text-falla-ink/60 font-medium text-lg md:text-xl max-w-lg mx-auto">
                  Journey back through the smoke and mirrors of previous years.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {archiveItems.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedYear(item.year)}
                    className="cursor-pointer"
                  >
                    <Card className="group overflow-hidden border-2 hover:translate-y-[-8px] transition-all duration-500">
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <Image src={item.image} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" removeWrapper />
                        <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-6 left-6 brutal-pill bg-falla-fire text-white border-white px-4 py-1">
                          <span className="text-lg font-display italic">{item.year}</span>
                        </div>
                      </div>
                      <CardBody className="p-8">
                        <h3 className="text-2xl font-display italic mb-3 lowercase">{item.title}</h3>
                        <p className="text-sm text-falla-ink/60 font-medium leading-relaxed mb-8">{item.description}</p>
                        
                        <div className="flex items-center gap-6 border-t-2 border-falla-ink/5 pt-6">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-falla-ink/40">
                            <Camera size={16} weight="bold" /> {item.stats.photos}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-falla-ink/40">
                            <ChatCircleDots size={16} weight="bold" /> {item.stats.stories}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  isIconOnly 
                  variant="ghost" 
                  onClick={() => setSelectedYear(null)}
                  className="w-12 h-12 rounded-xl border-2"
                >
                  <CaretLeft size={24} weight="bold" />
                </Button>
                <h2 className="text-4xl md:text-7xl font-display lowercase italic tracking-tighter">
                  {selectedYear} Highlights
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {yearData?.highlights.map((h) => (
                  <Card key={h.number} className="border-2 group">
                    <CardBody className="p-8 flex flex-col gap-6">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-falla-fire/10 text-falla-fire flex items-center justify-center border-2 border-falla-fire/20">
                          <Trophy size={32} weight="fill" />
                        </div>
                        <span className="text-xs font-black uppercase text-falla-fire tracking-[0.2em]">{h.reward}</span>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-black uppercase text-falla-ink/30 mb-1 tracking-widest">monument #{h.number}</p>
                        <h3 className="text-2xl font-display leading-tight italic lowercase">{h.name}</h3>
                      </div>

                      <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest mt-auto group-hover:bg-falla-fire group-hover:text-white transition-all">
                        View Story
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>

              <div className="p-12 text-center bg-white/30 ink-border rounded-[3rem] border-dashed border-2">
                <p className="font-bold opacity-30 italic text-xl">Full {selectedYear} map coming soon to the legacy archive.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
