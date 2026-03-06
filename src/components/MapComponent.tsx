import { useEffect, useRef, useContext, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import { Drawer } from "vaul";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@heroui/react";
import { motion } from "framer-motion";

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
  const [selectedFalla, setSelectedFalla] = useState<Falla | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredFallas = useMemo(() => {
    return fallasData.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.number.includes(searchQuery)
    );
  }, [fallasData, searchQuery]);

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
      // Clear existing markers
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};

      fallasData.forEach((falla: Falla) => {
        if (falla.coordinates?.lat && falla.coordinates?.lng) {
          const el = document.createElement("div");
          el.className = "marker";
          el.addEventListener('click', () => handleSelectFalla(falla));

          const marker = new mapboxgl.Marker(el)
            .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
            .addTo(map);
          
          markersRef.current[falla.number] = marker;
        }
      });
    });

    return () => map.remove();
  }, [isDarkMode, fallasData]);

  // Handle marker visibility during search
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
      
      {/* Search Overlay */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 left-6 right-6 md:left-6 md:right-auto md:w-80 z-10"
      >
        <Input 
          placeholder="Find a monument..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="flat"
          startContent={<MagnifyingGlass size={20} weight="bold" className="text-falla-ink/40" />}
          classNames={{
            inputWrapper: "bg-white/95 backdrop-blur-md ink-border soft-shadow h-14 rounded-2xl",
            input: "text-sm font-bold",
          }}
        />
      </motion.div>

      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} shouldScaleBackground>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100]" />
          <Drawer.Content className="bg-falla-paper flex flex-col rounded-t-[3rem] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-5xl mx-auto border-x-2 border-t-2 border-falla-ink shadow-solid">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-6" />
            
            <div className="flex-1 overflow-hidden relative">
              {selectedFalla && (
                <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
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
