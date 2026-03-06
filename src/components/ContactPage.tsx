import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@heroui/react";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-falla-paper py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="brutal-pill inline-block mb-6 bg-falla-fire/5 border-falla-fire/20 shadow-none px-4 py-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire">Get in touch</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display text-falla-ink mb-6 leading-tight">
            Connect with the <span className="text-falla-fire">Flame</span>
          </h1>
          <p className="text-falla-ink/60 font-medium text-lg md:text-xl max-w-lg mx-auto tracking-normal">
            Have questions about the festival? Found a missing Ninot? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Info Side */}
          <div className="md:col-span-5 space-y-8">
            <Card className="bg-falla-fire text-falla-paper border-falla-ink">
              <CardBody className="p-8">
                <h3 className="text-3xl font-display mb-6 leading-none">Valencia, ES</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Email Us</p>
                      <p className="font-bold">hola@fallamap.es</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Location</p>
                      <p className="font-bold">Ciutat Vella, Valencia</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="p-8 rounded-[2.5rem] ink-border bg-falla-sage/10 space-y-4">
              <div className="flex items-center gap-2 text-falla-sage">
                <MessageSquare className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-xs">Community Support</span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-falla-ink/70">
                Our team of dedicated Falleros is ready to help you navigate the city during the 2026 season. Expect a reply within 24 hours.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-7">
            <Card>
              <CardBody className="p-10">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-falla-ink/40 ml-2">Your Name</label>
                      <Input 
                        placeholder="John Doe" 
                        variant="flat" 
                        classNames={{
                          inputWrapper: "bg-falla-sand/20 rounded-2xl h-14 border-2 border-transparent focus-within:border-falla-ink transition-all px-6",
                          input: "text-sm font-bold"
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-falla-ink/40 ml-2">Email Address</label>
                      <Input 
                        type="email"
                        placeholder="john@example.com" 
                        variant="flat" 
                        classNames={{
                          inputWrapper: "bg-falla-sand/20 rounded-2xl h-14 border-2 border-transparent focus-within:border-falla-ink transition-all px-6",
                          input: "text-sm font-bold"
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-falla-ink/40 ml-2">Message</label>
                    <Textarea 
                      placeholder="Tell us what's on your mind..." 
                      variant="flat" 
                      minRows={6}
                      classNames={{
                        inputWrapper: "bg-falla-sand/20 rounded-[2rem] border-2 border-transparent focus-within:border-falla-ink transition-all p-6",
                        input: "text-base font-medium"
                      }}
                    />
                  </div>
                  <Button 
                    className="w-full h-16 rounded-2xl text-lg group shadow-solid active:shadow-none"
                    endContent={<Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  >
                    Send Message
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
