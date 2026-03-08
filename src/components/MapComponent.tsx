import { useEffect, useRef, useContext, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import { Drawer } from "vaul";
import { MagnifyingGlass, Target, CheckCircle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useUser } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";

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
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { isDarkMode } = useContext(ThemeContext);
  
  const [fallasData, setFallasData] = useState<Falla[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<'all' | 'visited' | 'standing'>('all');
  const [visitedNumbers, setVisitedNumbers] = useState<string[]>([]);
  const [likedNumbers, setLikedNumbers] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fallas } = await supabase.from("fallas").select("*").order("number");
        const merged = (fallas && fallas.length > 0) ? fallas : localFallas;
        setFallasData(merged as Falla[]);
      } catch (err) {
        setFallasData(localFallas as Falla[]);
      }
    };
    fetchData();
  }, []);

  // 2. Interaction Sync
  const refreshInteractions = useCallback(async () => {
    const localV = JSON.parse(localStorage.getItem("visited_fallas") || "[]");
    const localL = JSON.parse(localStorage.getItem("liked_fallas") || "[]");
    setVisitedNumbers(localV);
    setLikedNumbers(localL);

    if (user) {
      try {
        const { data } = await supabase
          .from("user_interactions")
          .select("type, fallas(number)")
          .eq("user_id", user.id);
        
        if (data) {
          const visited = data.filter(i => i.type === 'visited').map((i: any) => i.fallas?.number).filter(Boolean);
          const liked = data.filter(i => i.type === 'like').map((i: any) => i.fallas?.number).filter(Boolean);
          setVisitedNumbers(visited);
          setLikedNumbers(liked);
          localStorage.setItem("visited_fallas", JSON.stringify(visited));
          localStorage.setItem("liked_fallas", JSON.stringify(liked));
        }
      } catch (e) {
        console.warn("DB interaction sync failed");
      }
    }
  }, [user]);

  useEffect(() => {
    refreshInteractions();
  }, [refreshInteractions]);

  // 3. Initialize Map
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

    // Track User Location
    if ("geolocation" in navigator) {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      // Custom Bat Bat Icon via innerHTML
      el.innerHTML = `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Z" fill="#FF7043" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" fill="#FF7043"/><path d="M176,104a8,8,0,0,1-8,8H144v16h16a8,8,0,0,1,0,16H144v16a8,8,0,0,1-16,0V104a8,8,0,0,1,8-8h32A8,8,0,0,1,176,104Z" fill="#1A1A1A"/></svg>`;
      
      userMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([0, 0])
        .addTo(map);

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          userMarkerRef.current?.setLngLat([pos.coords.longitude, pos.coords.latitude]);
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};
        markerElsRef.current = {};
        map.remove();
      };
    }

    return () => {
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};
      markerElsRef.current = {};
      map.remove();
    };
  }, [isDarkMode]);

  // 4. Reactive Markers
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
          setSearchParams({ falla: falla.number }, { replace: true });
        });

        marker = new mapboxgl.Marker(el)
          .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
          .addTo(map);
        
        markersRef.current[falla.number] = marker;
        markerElsRef.current[falla.number] = el;
      }

      el.classList.toggle('visited', visitedNumbers.includes(falla.number));
      el.classList.toggle('liked', likedNumbers.includes(falla.number));
      el.classList.toggle('burnt', !!falla.is_burnt);
    });
  }, [fallasData, isDarkMode, visitedNumbers, likedNumbers]);

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

  const handleGeolocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          essential: true
        });
      });
    }
  };

  return (
    <div className="w-full h-full relative font-sans overflow-hidden transition-colors duration-500">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Consolidated Hub - Floating Island Aesthetic */}
      <div className="absolute top-4 md:top-28 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 md:px-0 z-10 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-falla-paper/90 dark:bg-zinc-950/90 backdrop-blur-xl border-2 border-falla-ink rounded-[2.5rem] p-2.5 md:p-3 flex flex-col gap-3 shadow-solid pointer-events-auto"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex-1 relative text-falla-ink bg-falla-ink/5 dark:bg-white/5 rounded-[1.5rem] border border-transparent focus-within:border-falla-fire/30 transition-all">
              <MagnifyingGlass size={22} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
              <input 
                placeholder="Find a monument..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-transparent pl-12 pr-10 font-bold text-sm outline-none placeholder:text-falla-ink/20 text-falla-ink"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-falla-ink/10 hover:bg-falla-ink/20 rounded-full transition-colors"
                  >
                    <X size={16} weight="bold" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <Button 
              isIconOnly 
              variant="ghost" 
              onClick={handleGeolocateUser} 
              className="h-12 w-12 rounded-[1.5rem] text-falla-ink bg-falla-paper ink-border shadow-solid-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              aria-label="Locate me"
            >
              <Target size={26} weight="bold" />
            </Button>
          </div>

          <div className="flex items-center justify-between px-2 pb-1 border-t border-falla-ink/5 pt-3">
            <div className="flex gap-2">
              {(['all', 'visited', 'standing'] as const).map((mode) => (
                <Button 
                  key={mode}
                  size="sm" 
                  variant={filterMode === mode ? 'default' : 'ghost'} 
                  onClick={() => setFilterMode(mode)}
                  className={cn(
                    "h-9 rounded-xl px-5 text-[11px] font-black uppercase transition-all", 
                    filterMode === mode ? "bg-falla-fire text-falla-paper shadow-none border-falla-fire" : "text-falla-ink/40 hover:bg-falla-ink/5"
                  )}
                >
                  {mode}
                </Button>
              ))}
            </div>
            
            <motion.div 
              layout
              className="flex items-center gap-2.5 px-4 bg-falla-fire/5 dark:bg-falla-fire/10 rounded-full py-2 border border-falla-fire/10 shadow-sm"
            >
              <CheckCircle size={18} weight="fill" className="text-falla-fire" />
              <span className="text-[11px] font-black text-falla-ink/60">
                {visitedNumbers.length}/{fallasData.length}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && handleDrawerClose()} shouldScaleBackground autoFocus={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100]" />
          <Drawer.Content className="bg-transparent flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none items-center justify-center pointer-events-none md:p-8 h-[100dvh]">
            <Drawer.Title className="sr-only">Falla Details</Drawer.Title>
            
            {/* Mobile Handler */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4 md:hidden pointer-events-auto" />
            
            <motion.div 
              layoutId="falla-card"
              className="w-full h-full md:max-w-5xl bg-falla-paper rounded-t-[3rem] md:rounded-[3rem] border-x-2 border-t-2 md:border-2 border-falla-ink shadow-solid flex flex-col overflow-hidden pointer-events-auto relative"
            >
              {/* Desktop Close Button */}
              <button 
                onClick={handleDrawerClose}
                className="hidden md:flex absolute top-10 right-10 w-14 h-14 items-center justify-center bg-falla-paper ink-border rounded-[1.5rem] shadow-solid hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 group text-falla-ink"
                aria-label="Close"
              >
                <X size={32} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {selectedFalla && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide overscroll-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedFalla.number}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "circOut" }}
                      className="h-full flex flex-col"
                    >
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
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
};

export default MapComponent;
