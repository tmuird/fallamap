import { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import { FallamapHeader } from "@/components/FallamapHeader.tsx";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // If scrolling down, hide the header
        setIsVisible(false);
      } else {
        // If scrolling up, show the header
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col justify-between h-screen">
      <FallamapHeader isVisible={isVisible} />
      <main className="overflow-auto py-4">
        <div className="map-container w-full max-w-4xl mx-auto my-8 aspect-video rounded-lg overflow-hidden shadow-lg">
          <MapComponent />
        </div>
      </main>
    </div>
  );
}
