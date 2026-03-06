import { useEffect, useRef, useContext, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { Button } from "@heroui/react";

const MapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MapboxAccessToken) {
  throw new Error("Missing Mapbox Access Token");
}

mapboxgl.accessToken = MapboxAccessToken;

interface Falla {
  id?: string;
  number: string;
  name: string;
  time: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { isDarkMode } = useContext(ThemeContext);
  const [fallasData, setFallasData] = useState<Falla[]>([]);
  const [selectedFalla, setSelectedFalla] = useState<Falla | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchFallas = async () => {
      try {
        const { data, error } = await supabase
          .from("fallas")
          .select("*")
          .order("number");

        if (error || !data || data.length === 0) {
          console.warn("Using local fallas data as fallback");
          setFallasData(localFallas as Falla[]);
        } else {
          setFallasData(data as Falla[]);
        }
      } catch (err) {
        console.error("Error fetching fallas from Supabase:", err);
        setFallasData(localFallas as Falla[]);
      }
    };

    fetchFallas();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: [-0.37739, 39.46975],
      zoom: 13,
      pitch: 45,
    });

    mapRef.current = map;

    map.on("load", () => {
      fallasData.forEach((falla: Falla) => {
        if (
          falla.coordinates &&
          falla.coordinates.lat !== 0.0 &&
          falla.coordinates.lng !== 0.0
        ) {
          const el = document.createElement("div");
          el.className = "marker"; // Styled in globals.css as a refined circle

          el.addEventListener('click', () => {
            setSelectedFalla(falla);
            setIsDrawerOpen(true);
            
            map.flyTo({
              center: [falla.coordinates.lng, falla.coordinates.lat],
              zoom: 15,
              essential: true
            });
          });

          new mapboxgl.Marker(el)
            .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
            .addTo(map);
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isDarkMode, fallasData]);

  return (
    <div className="w-full h-full relative group font-sans">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]" />
          <Drawer.Content className="bg-background flex flex-col rounded-t-[2.5rem] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-5xl mx-auto border-x-2 border-t-2 border-falla-ink shadow-solid">
            <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-falla-ink/10 my-4" />
            
            <div className="flex-1 overflow-hidden relative">
              <Button 
                isIconOnly 
                variant="light" 
                className="absolute right-6 top-2 z-50 rounded-full hover:bg-falla-ink/5"
                onClick={() => setIsDrawerOpen(false)}
              >
                <X className="w-5 h-5 text-falla-ink/40" />
              </Button>
              
              {selectedFalla && (
                <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
                  <FallaDetails falla={selectedFalla} />
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Minimal Floating Info */}
      <div className="absolute top-6 left-6 z-10 hidden md:block">
        <div className="bg-falla-paper ink-border px-5 py-2.5 rounded-2xl soft-shadow flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-falla-fire rounded-full animate-pulse" />
          <span className="text-sm font-black uppercase tracking-tight text-falla-ink">
            Falla<span className="text-falla-fire">Map</span>
          </span>
          <div className="w-[1px] h-4 bg-falla-ink/10" />
          <span className="text-[10px] font-black text-falla-ink/40 uppercase tracking-widest">Valencia 2026</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
