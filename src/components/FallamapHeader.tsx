"use client";
import { title } from "@/components/primitives.ts";
import "../styles/globals.css";

export function FallamapHeader({}) {
  return (
    <div className="w-full  flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
        <span className={title({ color: "orange", size: "lg" })}>
          Welcome to{" "}
        </span>
        <span className={title({ color: "orange", size: "lg" })}>Fallamap</span>
      </h1>
    </div>
  );
}
