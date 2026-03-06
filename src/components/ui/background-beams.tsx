"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveBeams = (e: MouseEvent) => {
      if (!beamsRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      beamsRef.current.style.setProperty("--x", `${x}%`);
      beamsRef.current.style.setProperty("--y", `${y}%`);
    };

    window.addEventListener("mousemove", moveBeams);
    return () => window.removeEventListener("mousemove", moveBeams);
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden",
        className
      )}
      style={
        {
          "--x": "50%",
          "--y": "50%",
          background: `radial-gradient(circle at var(--x) var(--y), var(--falla-fire) 0%, transparent 50%)`,
        } as React.CSSProperties
      }
    />
  );
};
