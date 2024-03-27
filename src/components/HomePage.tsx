import MapComponent from "./MapComponent";
import { FallamapHeader } from "@/components/FallamapHeader.tsx";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <FallamapHeader />

      <div className="map-container w-full h-full max-w-4xl mx-auto my-8 aspect-video rounded-lg overflow-hidden shadow-lg">
        <MapComponent></MapComponent>
      </div>

      <div className="mt-8">{/* Additional content */}</div>
    </section>
  );
}
