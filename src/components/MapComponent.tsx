import { useEffect, useRef, useContext, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import { Drawer } from "vaul";
import { MagnifyingGlass, Target, Funnel, CheckCircle } from "@phosphor-icons/react";
import { Input } from "@heroui/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

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
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { isDarkMode } = useContext(ThemeContext);
  const [fallasData, setFallasData] = useState<Falla[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);
  const [visitedNumbers, setVisitedNumbers] = useState<string[]>([]);
  const [selectedFalla, setSelectedFalla] = useState<Falla | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const visited = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
    setVisitedNumbers(visited);
  }, [isDrawerOpen]);

  const filteredFallas = useMemo(() => {
    return fallasData.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.number.includes(searchQuery);
      const matchesVisited = showVisitedOnly ? visitedNumbers.includes(f.number) : true;
      return matchesSearch && matchesVisited;
    });
  }, [fallasData, searchQuery, showVisitedOnly, visitedNumbers]);

  useEffect(() => {
    const fetchFallas = async () => {
      try {
        const { data, error } = await supabase
          .from("fallas")
          .select("*")
          .order("number");

        if (error || !data || data.length === 0) {
          setFallasData(localFallas as Falla[]);
        } else {
          setFallasData(data as Falla[]);
        }
      } catch (err) {
        setFallasData(localFallas as Falla[]);
      }
    };
    fetchFallas();
  }, []);

  const flyToFalla = (falla: Falla) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [falla.coordinates.lng, falla.coordinates.lat],
        zoom: 16,
        pitch: 60,
        essential: true
      });
    }
  };

  const handleSelectFalla = (falla: Falla) => {
    setSelectedFalla(falla);
    setIsDrawerOpen(true);
    flyToFalla(falla);
  };

  const navigateFalla = (direction: 'next' | 'prev') => {
    if (!selectedFalla) return;
    const currentIndex = fallasData.findIndex(f => f.number === selectedFalla.number);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % fallasData.length;
    } else {
      nextIndex = (currentIndex - 1 + fallasData.length) % fallasData.length;
    }
    const nextFalla = fallasData[nextIndex];
    setSelectedFalla(nextFalla);
    flyToFalla(nextFalla);
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15,
            essential: true
          });
          new mapboxgl.Marker({ color: "#FF5F1F", scale: 0.8 })
            .setLngLat([position.coords.longitude, position.coords.latitude])
            .addTo(mapRef.current);
        }
      });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: [-0.37739, 39.46975],
      zoom: 13,
      pitch: 45,
    });

    mapRef.current = map;

    map.on("load", () => {
      fallasData.forEach((falla: Falla) => {
        if (falla.coordinates?.lat && falla.coordinates?.lng) {
          const isVisited = visitedNumbers.includes(falla.number);
          const el = document.createElement("div");
          el.className = `marker ${isVisited ? 'visited' : ''}`;
          el.style.backgroundColor = isVisited ? "#6B705C" : "#FF5F1F"; // Sage for visited, Fire for new

          el.addEventListener('click', () => handleSelectFalla(falla));

          const marker = new mapboxgl.Marker(el)
            .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
            .addTo(map);
          
          markersRef.current[falla.number] = marker;
        }
      });
    });

    return () => map.remove();
  }, [isDarkMode, fallasData, visitedNumbers]);

  useEffect(() => {
    fallasData.forEach(f => {
      const marker = markersRef.current[f.number];
      if (!marker) return;
      const isVisible = filteredFallas.some(ff => ff.number === f.number);
      marker.getElement().style.display = isVisible ? "block" : "none";
    });
  }, [filteredFallas, fallasData]);

  return (
    <div className="w-full h-full relative group font-sans overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Top UI Bar */}
      <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row gap-3 pointer-events-none">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pointer-events-auto flex-1 md:max-w-sm">
          <Input 
            placeholder="Search monuments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="flat"
            startContent={<MagnifyingGlass size={20} weight="bold" className="text-falla-ink/40" />}
            classNames={{
              inputWrapper: "bg-white/95 backdrop-blur-md ink-border shadow-solid h-14 rounded-2xl",
              input: "text-sm font-bold",
            }}
          />
        </motion.div>

        <div className="flex gap-2 pointer-events-auto">
          <Button 
            isIconOnly 
            onClick={() => setShowVisitedOnly(!showVisitedOnly)}
            className={cn(
              "w-14 h-14 bg-white/90 backdrop-blur-md ink-border shadow-solid rounded-2xl transition-all",
              showVisitedOnly && "bg-falla-sage text-white"
            )}
          >
            <Funnel size={24} weight={showVisitedOnly ? "fill" : "bold"} />
          </Button>
          <Button 
            isIconOnly 
            onClick={handleGeolocation}
            className="w-14 h-14 bg-white/90 backdrop-blur-md ink-border shadow-solid rounded-2xl"
          >
            <Target size={24} weight="bold" />
          </Button>
        </div>
      </div>

      {/* Progress Badge */}
      <div className="absolute bottom-10 left-6 z-10 pointer-events-none">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-falla-ink text-white px-4 py-2 rounded-xl ink-border shadow-solid flex items-center gap-3">
          <CheckCircle size={20} weight="fill" className="text-falla-sage" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {visitedNumbers.length} / {fallasData.length} Discovered
          </span>
        </motion.div>
      </div>

      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} shouldScaleBackground autoFocus={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100]" />
          <Drawer.Content className="bg-[#FAF7F2] flex flex-col rounded-t-[3rem] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-5xl mx-auto border-x-2 border-t-2 border-falla-ink shadow-solid">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4 md:my-6" />
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {selectedFalla && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-none">
                  <FallaDetails 
                    falla={selectedFalla} 
                    onNext={() => navigateFalla('next')}
                    onPrev={() => navigateFalla('prev')}
                    onClose={() => setIsDrawerOpen(false)}
                  />
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
};

export default MapComponent;
