import { useEffect, useRef, useContext, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import { Drawer } from "vaul";
import { MagnifyingGlass, Target, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useUser } from "@clerk/react";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  
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
    const fetchData = async () => {
      try {
        const { data: fallas } = await supabase.from("fallas").select("*").order("number");
        const allFallas = (fallas && fallas.length > 0) ? fallas : localFallas;
        setFallasData(allFallas as Falla[]);

        if (user) {
          const { data: interactions } = await supabase
            .from("user_interactions")
            .select("fallas(number)")
            .eq("user_id", user.id)
            .eq("type", "visited");
          
          if (interactions) {
            const numbers = interactions.map((i: any) => i.fallas?.number).filter(Boolean);
            setVisitedNumbers(numbers);
          }
        } else {
          const localVisited = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
          setVisitedNumbers(localVisited);
        }
      } catch (err) {
        setFallasData(localFallas as Falla[]);
      }
    };
    fetchData();
  }, [user]);

  const flyToFalla = (falla: Falla) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [falla.coordinates.lng, falla.coordinates.lat],
        zoom: 16,
        pitch: 60,
        duration: 2000,
        essential: true
      });
    }
  };

  const handleSelectFalla = (falla: Falla) => {
    setSelectedFalla(falla);
    setIsDrawerOpen(true);
    setSearchParams({ falla: falla.number }, { replace: true });
    flyToFalla(falla);
  };

  useEffect(() => {
    const fallaNum = searchParams.get("falla");
    if (fallaNum && fallasData.length > 0) {
      const falla = fallasData.find(f => f.number === fallaNum);
      if (falla) {
        handleSelectFalla(falla);
      }
    }
  }, [searchParams, fallasData]);

  const filteredFallas = useMemo(() => {
    return fallasData.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.number.includes(searchQuery);
      if (filterMode === 'visited') return matchesSearch && visitedNumbers.includes(f.number);
      if (filterMode === 'standing') return matchesSearch && !f.is_burnt;
      return matchesSearch;
    });
  }, [fallasData, searchQuery, filterMode, visitedNumbers]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSearchParams({}, { replace: true });
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        mapRef.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15,
          essential: true
        });
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

          new mapboxgl.Marker(el)
            .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
            .addTo(map);
        }
      });
    });

    return () => map.remove();
  }, [isDarkMode, fallasData, visitedNumbers]);

  useEffect(() => {
    // This effect is purely to react to filteredFallas changes if needed
    // In a GeoJSON source approach, we would update the source here.
  }, [filteredFallas]);

  return (
    <div className="w-full h-full relative group font-sans overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-10">
        <div className="bg-white/95 backdrop-blur-md ink-border shadow-solid rounded-3xl p-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-falla-ink/30" />
              <input 
                placeholder="Search València..." 
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
              {(['all', 'visited', 'standing'] as const).map((mode) => (
                <Button 
                  key={mode}
                  size="sm" 
                  variant={filterMode === mode ? 'default' : 'ghost'} 
                  onClick={() => setFilterMode(mode)}
                  className={cn("h-8 rounded-xl px-4 text-[10px] font-black uppercase", filterMode === mode ? "bg-falla-fire text-white" : "text-falla-ink/40")}
                >
                  {mode}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-1.5 px-2 bg-falla-ink/5 rounded-full py-1">
              <CheckCircle size={14} weight="fill" className="text-falla-sage" />
              <span className="text-[10px] font-black text-falla-ink/60">
                {visitedNumbers.length}/{fallasData.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen} shouldScaleBackground autoFocus={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100]" />
          <Drawer.Content className="bg-[#FAF7F2] flex flex-col rounded-t-[3rem] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none max-w-5xl mx-auto border-x-2 border-t-2 border-falla-ink shadow-solid">
            <Drawer.Title className="sr-only">Falla Details</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4 md:my-6" />
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {selectedFalla && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-none">
                  <FallaDetails 
                    falla={selectedFalla} 
                    onNext={() => {
                      const idx = fallasData.findIndex(f => f.number === selectedFalla.number);
                      const next = fallasData[(idx + 1) % fallasData.length];
                      handleSelectFalla(next);
                    }}
                    onPrev={() => {
                      const idx = fallasData.findIndex(f => f.number === selectedFalla.number);
                      const prev = fallasData[(idx - 1 + fallasData.length) % fallasData.length];
                      handleSelectFalla(prev);
                    }}
                    onClose={handleDrawerClose}
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
