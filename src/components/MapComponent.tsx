import { useEffect, useRef, useContext, useState, useMemo, useCallback } from "react";
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
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const markerElsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { isDarkMode } = useContext(ThemeContext);
  
  const [fallasData, setFallasData] = useState<Falla[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<'all' | 'visited' | 'standing'>('all');
  const [visitedNumbers, setVisitedNumbers] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Fetch data
  useEffect(() => {
    const fetchFallas = async () => {
      try {
        const { data: fallas } = await supabase.from("fallas").select("*").order("number");
        setFallasData(((fallas && fallas.length > 0) ? fallas : localFallas) as Falla[]);
      } catch (err) {
        setFallasData(localFallas as Falla[]);
      }
    };
    fetchFallas();
  }, []);

  // 2. Fetch Passport State
  const refreshInteractions = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from("user_interactions")
        .select("fallas(number)")
        .eq("user_id", user.id)
        .eq("type", "visited");
      
      if (data) {
        const numbers = data.map((i: any) => i.fallas?.number).filter(Boolean);
        setVisitedNumbers(numbers);
        localStorage.setItem("visited_fallas", JSON.stringify(numbers)); // Keep local in sync
      }
    } else {
      setVisitedNumbers(JSON.parse(localStorage.getItem("visited_fallas") || "[]"));
    }
  }, [user]);

  useEffect(() => {
    refreshInteractions();
  }, [refreshInteractions]);

  // 3. Initialize Map (Strictly Once)
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
    return () => map.remove();
  }, [isDarkMode]);

  // 4. Stable Marker Logic
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fallasData.length === 0) return;

    fallasData.forEach((falla) => {
      let marker = markersRef.current[falla.number];
      let el = markerElsRef.current[falla.number];

      if (!marker) {
        el = document.createElement("div");
        el.className = 'marker';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSearchParams({ falla: falla.number }, { replace: true }); // Let URL drive the open
        });

        marker = new mapboxgl.Marker(el)
          .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
          .addTo(map);
        
        markersRef.current[falla.number] = marker;
        markerElsRef.current[falla.number] = el;
      }

      el.classList.toggle('visited', visitedNumbers.includes(falla.number));
      el.classList.toggle('burnt', !!falla.is_burnt);
    });
  }, [fallasData, isDarkMode, visitedNumbers]);

  // 5. URL driven selection (Solves double popup)
  const selectedFalla = useMemo(() => {
    const num = searchParams.get("falla");
    return fallasData.find(f => f.number === num) || null;
  }, [searchParams, fallasData]);

  useEffect(() => {
    if (selectedFalla) {
      setIsDrawerOpen(true);
      mapRef.current?.flyTo({
        center: [selectedFalla.coordinates.lng, selectedFalla.coordinates.lat],
        zoom: 16,
        pitch: 60,
        duration: 2000,
        essential: true
      });
    } else {
      setIsDrawerOpen(false);
    }
  }, [selectedFalla]);

  const handleDrawerClose = () => {
    setSearchParams({}, { replace: true });
  };

  const filteredFallas = useMemo(() => {
    return fallasData.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.number.includes(searchQuery);
      if (filterMode === 'visited') return matchesSearch && visitedNumbers.includes(f.number);
      if (filterMode === 'standing') return matchesSearch && !f.is_burnt;
      return matchesSearch;
    });
  }, [fallasData, searchQuery, filterMode, visitedNumbers]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([num, marker]) => {
      const isVisible = filteredFallas.some(f => f.number === num);
      marker.getElement().style.display = isVisible ? 'block' : 'none';
    });
  }, [filteredFallas]);

  return (
    <div className="w-full h-full relative font-sans overflow-hidden">
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
            <Button isIconOnly variant="ghost" onClick={() => mapRef.current?.flyTo({ center: [-0.37739, 39.46975], zoom: 13 })} className="h-12 w-12 rounded-2xl">
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
                  className={cn("h-8 rounded-xl px-4 text-[10px] font-black uppercase transition-none", filterMode === mode ? "bg-falla-fire text-white shadow-none" : "text-falla-ink/40")}
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

      <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && handleDrawerClose()} shouldScaleBackground autoFocus={false}>
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
                      setSearchParams({ falla: next.number }, { replace: true });
                    }}
                    onPrev={() => {
                      const idx = fallasData.findIndex(f => f.number === selectedFalla.number);
                      const prev = fallasData[(idx - 1 + fallasData.length) % fallasData.length];
                      setSearchParams({ falla: prev.number }, { replace: true });
                    }}
                    onClose={handleDrawerClose}
                    onInteraction={refreshInteractions}
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
