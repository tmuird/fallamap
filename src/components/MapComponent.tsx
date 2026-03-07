import { useEffect, useRef, useContext, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import { Drawer } from "vaul";
import { MagnifyingGlass, Target, CheckCircle } from "@phosphor-icons/react";
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
  is_burnt?: boolean;
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
  const [filterMode, setFilterMode] = useState<'all' | 'visited' | 'standing'>('all');
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
      if (filterMode === 'visited') return matchesSearch && visitedNumbers.includes(f.number);
      if (filterMode === 'standing') return matchesSearch && !f.is_burnt;
      return matchesSearch;
    });
  }, [fallasData, searchQuery, filterMode, visitedNumbers]);

  useEffect(() => {
    const fetchFallas = async () => {
      try {
        const { data, error } = await supabase.from("fallas").select("*").order("number");
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

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15,
            essential: true
          });
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
          el.className = `marker ${isVisited ? 'visited' : ''} ${falla.is_burnt ? 'burnt' : ''}`;
          el.style.backgroundColor = falla.is_burnt ? "#1A1A1A" : (isVisited ? "#6B705C" : "#FF5F1F");

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
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-10">
        <div className="bg-white/90 backdrop-blur-md ink-border shadow-solid rounded-3xl p-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-falla-ink/30" />
              <input 
                placeholder="Search monuments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-transparent pl-12 pr-4 font-bold text-sm outline-none placeholder:text-falla-ink/20"
              />
            </div>
            <Button isIconOnly variant="ghost" onClick={handleGeolocation} className="h-12 w-12 rounded-2xl">
              <Target size={24} weight="bold" />
            </Button>
          </div>

          <div className="flex items-center justify-between px-2 pb-1 border-t border-falla-ink/5 pt-2">
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={filterMode === 'all' ? 'default' : 'ghost'} 
                onClick={() => setFilterMode('all')}
                className={cn("h-8 rounded-xl px-4 text-[10px] font-black uppercase", filterMode === 'all' ? "bg-falla-fire text-white" : "text-falla-ink/40")}
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={filterMode === 'visited' ? 'default' : 'ghost'} 
                onClick={() => setFilterMode('visited')}
                className={cn("h-8 rounded-xl px-4 text-[10px] font-black uppercase", filterMode === 'visited' ? "bg-falla-sage text-white" : "text-falla-ink/40")}
              >
                Visited
              </Button>
              <Button 
                size="sm" 
                variant={filterMode === 'standing' ? 'default' : 'ghost'} 
                onClick={() => setFilterMode('standing')}
                className={cn("h-8 rounded-xl px-4 text-[10px] font-black uppercase", filterMode === 'standing' ? "bg-falla-fire text-white" : "text-falla-ink/40")}
              >
                Standing
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-4 w-px bg-falla-ink/10 mx-1" />
              <div className="flex items-center gap-1.5 px-2">
                <CheckCircle size={16} weight="fill" className="text-falla-sage" />
                <span className="text-[10px] font-black text-falla-ink/40">
                  {visitedNumbers.length}/{fallasData.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} shouldScaleBackground autoFocus={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100]" />
          <Drawer.Content className="bg-[#FAF7F2] flex flex-col rounded-t-[3rem] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-5xl mx-auto border-x-2 border-t-2 border-falla-ink shadow-solid">
            {/* Screen Reader Only Title & Description */}
            <Drawer.Title className="sr-only">Monument Details</Drawer.Title>
            <Drawer.Description className="sr-only">View photos and community notes for this Falla</Drawer.Description>
            
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4 md:my-6" />
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {selectedFalla && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-none">
                  <FallaDetails 
                    falla={selectedFalla} 
                    onNext={() => {
                      const idx = fallasData.findIndex(f => f.number === selectedFalla.number);
                      const next = fallasData[(idx + 1) % fallasData.length];
                      setSelectedFalla(next);
                      flyToFalla(next);
                    }}
                    onPrev={() => {
                      const idx = fallasData.findIndex(f => f.number === selectedFalla.number);
                      const prev = fallasData[(idx - 1 + fallasData.length) % fallasData.length];
                      setSelectedFalla(prev);
                      flyToFalla(prev);
                    }}
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
