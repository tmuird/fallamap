import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";
import { Image } from "@heroui/react";
import { Camera, ChatCircleDots } from "@phosphor-icons/react";

const archiveItems = [
  {
    year: "2025",
    title: "The Year of the Phoenix",
    description: "A celebration of rebirth and artistic resilience.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
    stats: { photos: 1240, stories: 850 }
  },
  {
    year: "2024",
    title: "Digital Satire",
    description: "When the streets became a canvas for the first digital-era Falles.",
    image: "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&q=80&w=800",
    stats: { photos: 980, stories: 420 }
  },
  {
    year: "2023",
    title: "Light & Shadow",
    description: "The return of the grand monuments after the silent years.",
    image: "https://images.unsplash.com/photo-1512753360435-329c4535a9a7?auto=format&fit=crop&q=80&w=800",
    stats: { photos: 2100, stories: 1100 }
  }
];

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-falla-paper py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="brutal-pill inline-block mb-6 bg-white border-falla-ink/20 shadow-none px-4 py-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">History</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display text-falla-ink mb-6 leading-tight italic">
            Falla Archive
          </h1>
          <p className="text-falla-ink/60 font-medium text-lg md:text-xl max-w-lg mx-auto">
            Journey back through the smoke and mirrors of previous years.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {archiveItems.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image src={item.image} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" removeWrapper />
                  <div className="absolute inset-0 bg-gradient-to-t from-falla-ink/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 left-6 brutal-pill bg-falla-fire text-white border-white px-4 py-1">
                    <span className="text-lg font-display italic">{item.year}</span>
                  </div>
                </div>
                <CardBody className="p-8">
                  <h3 className="text-2xl font-display italic mb-3">{item.title}</h3>
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
      </div>
    </div>
  );
}
