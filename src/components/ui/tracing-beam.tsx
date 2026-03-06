"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/utils/cn";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scrollYDelayed = useSpring(scrollYProgress, {
    stiffness: 500,
    damping: 90,
  });

  const height = useTransform(scrollYDelayed, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative w-full max-w-4xl mx-auto h-full", className)}
    >
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2.5px] bg-falla-ink/5 overflow-hidden">
        <motion.div 
          style={{ height }}
          className="w-full bg-falla-fire shadow-[0_0_15px_rgba(255,95,31,0.5)]"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
