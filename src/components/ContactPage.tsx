import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@heroui/react";
import { Envelope, MapPin, PaperPlaneTilt, ChatCircleDots, CheckCircle } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);

      if (error) throw error;

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Message sent!", {
        description: "We'll get back to you within 24 hours.",
      });
    } catch {
      toast.error("Couldn't send your message. Try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-falla-paper pt-32 pb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="brutal-pill inline-block mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-falla-fire flex items-center gap-2">
              <ChatCircleDots size={14} weight="bold" /> Get in touch
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display text-falla-ink mb-6 leading-tight lowercase">
            Connect with the <span className="text-falla-fire">Flame</span>
          </h1>
          <p className="text-falla-ink/60 font-medium text-lg md:text-xl max-w-lg mx-auto tracking-normal">
            Have questions about the festival? Found a missing Ninot? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Info side */}
          <div className="md:col-span-5 space-y-8">
            <Card className="bg-falla-fire text-falla-paper border-falla-ink border-2 shadow-solid">
              <CardBody className="p-8">
                <h3 className="text-4xl font-display mb-8 leading-none lowercase">València</h3>
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Envelope className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-0.5">
                        Email Us
                      </p>
                      <p className="font-bold text-lg">hola@fallamap.es</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <MapPin className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-0.5">
                        Location
                      </p>
                      <p className="font-bold text-lg">Ciutat Vella, València</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="p-8 rounded-[2.5rem] ink-border bg-falla-sand/20 space-y-4 border-2 border-dashed border-falla-ink/20">
              <div className="flex items-center gap-2 text-falla-fire">
                <ChatCircleDots className="w-6 h-6" weight="bold" />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  Community Support
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-falla-ink/60">
                Our team of dedicated Falleros is ready to help you navigate the city during the
                2026 season. Expect a reply within 24 hours.
              </p>
            </div>
          </div>

          {/* Form side */}
          <div className="md:col-span-7">
            <Card className="bg-falla-paper border-2 border-falla-ink soft-shadow">
              <CardBody className="p-8 md:p-12">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-falla-fire/10 border-2 border-falla-fire/20 flex items-center justify-center">
                      <CheckCircle size={40} weight="fill" className="text-falla-fire" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-display lowercase text-falla-ink mb-2">
                        Message sent!
                      </h3>
                      <p className="text-sm font-medium text-falla-ink/50">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-2 border-falla-ink rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-solid-sm hover:shadow-none transition-all"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another
                    </Button>
                  </motion.div>
                ) : (
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-ink/40 ml-1">
                          Your Name
                        </label>
                        <Input
                          placeholder="John Doe"
                          variant="flat"
                          value={name}
                          onValueChange={setName}
                          isRequired
                          classNames={{
                            inputWrapper:
                              "bg-falla-paper rounded-2xl h-14 border-2 border-falla-ink/5 focus-within:border-falla-fire transition-all px-6 text-falla-ink",
                            input: "text-sm font-bold text-falla-ink",
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-ink/40 ml-1">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          variant="flat"
                          value={email}
                          onValueChange={setEmail}
                          isRequired
                          classNames={{
                            inputWrapper:
                              "bg-falla-paper rounded-2xl h-14 border-2 border-falla-ink/5 focus-within:border-falla-fire transition-all px-6 text-falla-ink",
                            input: "text-sm font-bold text-falla-ink",
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-falla-ink/40 ml-1">
                        Message
                      </label>
                      <Textarea
                        placeholder="Tell us what's on your mind..."
                        variant="flat"
                        minRows={6}
                        value={message}
                        onValueChange={setMessage}
                        isRequired
                        classNames={{
                          inputWrapper:
                            "bg-falla-paper rounded-[2rem] border-2 border-falla-ink/5 focus-within:border-falla-fire transition-all p-6 text-falla-ink",
                          input: "text-base font-medium text-falla-ink",
                        }}
                      />
                    </div>
                    <Button
                      type="submit"
                      isLoading={submitting}
                      className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest group shadow-solid active:shadow-none bg-falla-fire text-falla-paper border-2 border-falla-ink"
                      endContent={
                        !submitting && (
                          <PaperPlaneTilt
                            size={20}
                            weight="bold"
                            className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                          />
                        )
                      }
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
