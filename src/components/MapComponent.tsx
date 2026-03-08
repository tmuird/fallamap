import { useEffect, useRef, useContext, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { FallaDetails } from "./ui/FallaDetails";
import { supabase } from "@/lib/supabase";
import localFallas from "./fallas.json";
import officialHubs from "./official_events.json";
import { Drawer } from "vaul";
import { MagnifyingGlass, Target, CheckCircle, X, Star, Heart, CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useUser } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";

const MapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MapboxAccessToken) {
  throw new Error("Missing Mapbox Access Token");
}

mapboxgl.accessToken = MapboxAccessToken;

interface POI {
  id?: string;
  number?: string;
  name: string;
  time?: string;
  is_burnt?: boolean;
  is_special?: boolean;
  is_hub?: boolean;
  description?: string;
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
  
  const [fallasData, setFallasData] = useState<POI[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<'all' | 'visited' | 'special' | 'liked' | 'events'>('all');
  const [visitedNumbers, setVisitedNumbers] = useState<string[]>([]);
  const [likedNumbers, setLikedNumbers] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fallas } = await supabase.from("fallas").select("*").order("number");
        const merged = (fallas && fallas.length > 0) ? fallas : localFallas;
        setFallasData(merged as POI[]);
      } catch (err) {
        setFallasData(localFallas as POI[]);
      }
    };
    fetchData();
  }, []);

  const allPOIs = useMemo(() => {
    const hubs = (officialHubs as any[]).map(h => ({ ...h, is_hub: true }));
    return [...fallasData, ...hubs];
  }, [fallasData]);

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

    const updateMarkerScale = () => {
      const zoom = map.getZoom();
      // Base zoom 14 = scale 1.0
      // Zoom 10 = scale 0.4
      // Zoom 18 = scale 1.2
      let scale = 1.0;
      if (zoom <= 14) {
        // More aggressive shrinking at lower zooms to prevent overlap
        scale = Math.max(0.35, 1 - (14 - zoom) * 0.15);
      } else {
        scale = Math.min(1.2, 1 + (zoom - 14) * 0.05);
      }
      mapContainerRef.current?.style.setProperty('--marker-scale', scale.toString());
      
      // Landmark (Hub) specific scale adjustment
      let hubScale = scale;
      if (zoom < 12) {
        hubScale = scale * 0.8; // Shrink hubs even more at very low zoom
      }
      mapContainerRef.current?.style.setProperty('--hub-scale', hubScale.toString());
    };

    map.on('zoom', updateMarkerScale);
    updateMarkerScale(); // Initial call

    if ("geolocation" in navigator) {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.innerHTML = `
        <div class="relative w-8 h-8">
          <div class="absolute inset-0 bg-[#007AFF]/20 rounded-full animate-ping"></div>
          <div class="relative w-full h-full bg-[#007AFF] rounded-full border-2 border-white shadow-solid-sm flex items-center justify-center">
            <svg viewBox="0 0 256 256" class="w-5 h-5 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M232,104c0,0-24-16-48-16s-48,16-48,16s-4-16-8-16s-8,16-8,16s-24-16-48-16s-48,16-48,16s0,48,48,64s48,0,48,0s4,12,8,12s8-12,8-12s0,12,48,0S232,104,232,104z"/>
            </svg>
          </div>
        </div>
      `;
      
      userMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([0, 0])
        .addTo(map);

      let initialZoomDone = false;

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          userMarkerRef.current?.setLngLat([longitude, latitude]);
          
          if (!initialZoomDone) {
            map.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 2000,
              essential: true
            });
            initialZoomDone = true;
          }
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
    if (!map || allPOIs.length === 0) return;

    allPOIs.forEach((poi) => {
      const key = poi.number || poi.id || poi.name;
      let marker = markersRef.current[key];
      let el = markerElsRef.current[key];

      if (!marker) {
        el = document.createElement("div");
        el.className = poi.is_hub ? 'marker hub' : 'marker';
        
        if (poi.is_hub) {
          el.innerHTML = `<div class="hub-icon"><svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,56a32,32,0,1,1-32,32A32,32,0,0,1,128,72Z" fill="white"/></svg></div>`;
        }

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (poi.number) {
            setSearchParams({ falla: poi.number }, { replace: true });
          } else {
            setSearchParams({ hub: poi.id as string }, { replace: true });
          }
        });

        marker = new mapboxgl.Marker(el)
          .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
          .addTo(map);
        
        markersRef.current[key] = marker;
        markerElsRef.current[key] = el;
      }

      if (!poi.is_hub) {
        el.classList.toggle('visited', visitedNumbers.includes(poi.number || ""));
        el.classList.toggle('liked', likedNumbers.includes(poi.number || ""));
        el.classList.toggle('burnt', !!poi.is_burnt);
      }
    });
  }, [allPOIs, isDarkMode, visitedNumbers, likedNumbers]);

  const selectedPOI = useMemo(() => {
    const fallaNum = searchParams.get("falla");
    const hubId = searchParams.get("hub");
    if (fallaNum) return allPOIs.find(p => p.number === fallaNum) || null;
    if (hubId) return allPOIs.find(p => p.id === hubId) || null;
    return null;
  }, [searchParams, allPOIs]);

  useEffect(() => {
    if (selectedPOI) {
      setIsDrawerOpen(true);
      mapRef.current?.flyTo({
        center: [selectedPOI.coordinates.lng, selectedPOI.coordinates.lat],
        zoom: 16,
        pitch: 60,
        duration: 2000,
        essential: true
      });
    } else {
      setIsDrawerOpen(false);
    }
  }, [selectedPOI]);

  const handleDrawerClose = () => {
    setSearchParams({}, { replace: true });
  };

  const filteredPOIs = useMemo(() => {
    return allPOIs.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.number && p.number.includes(searchQuery));
      if (filterMode === 'visited') return matchesSearch && !p.is_hub && visitedNumbers.includes(p.number || "");
      if (filterMode === 'special') return matchesSearch && !p.is_hub && p.is_special;
      if (filterMode === 'liked') return matchesSearch && !p.is_hub && likedNumbers.includes(p.number || "");
      if (filterMode === 'events') return matchesSearch && p.is_hub;
      return matchesSearch;
    });
  }, [allPOIs, searchQuery, filterMode, visitedNumbers, likedNumbers]);

  const autocompleteResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return allPOIs
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.number && p.number.includes(searchQuery)))
      .slice(0, 5);
  }, [searchQuery, allPOIs]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      const isVisible = filteredPOIs.some(p => (p.number || p.id || p.name) === key);
      marker.getElement().style.display = isVisible ? 'block' : 'none';
    });
  }, [filteredPOIs]);

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

  const handleAutocompleteClick = (poi: POI) => {
    setSearchQuery("");
    if (poi.number) {
      setSearchParams({ falla: poi.number }, { replace: true });
    } else {
      setSearchParams({ hub: poi.id as string }, { replace: true });
    }
    setIsSearchFocused(false);
  };

  return (
    <div className="w-full h-full relative font-sans overflow-hidden transition-colors duration-500">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-[100] pointer-events-none flex flex-col"
        style={{ top: 'calc(3rem + env(safe-area-inset-top, 0px))' }}
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "bg-falla-paper/90 dark:bg-zinc-950/90 backdrop-blur-md border-2 border-falla-ink shadow-solid pointer-events-auto transition-all duration-300 overflow-hidden flex flex-col",
            "rounded-[2rem] md:rounded-[2.5rem]"
          )}
        >
          <div className="p-2 md:p-3 flex flex-col gap-2 md:gap-3 shrink-0 z-20 bg-transparent">
            <div className="flex items-center gap-2 md:gap-3 h-10 md:h-12">
              <div className="flex-1 flex items-center relative text-falla-ink bg-falla-ink/5 dark:bg-white/5 rounded-[1.25rem] border border-transparent focus-within:border-falla-fire/30 transition-all px-3 md:px-4 h-full overflow-hidden">
                <MagnifyingGlass size={18} weight="bold" className="opacity-30 shrink-0 md:size-[22px]" />
                <input 
                  placeholder="Find a monument or event..." 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent px-2 md:px-3 font-bold text-xs md:text-sm outline-none placeholder:text-falla-ink/30 text-falla-ink h-full min-w-0"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery("")}
                      className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-falla-ink/10 hover:bg-falla-ink/20 rounded-full transition-colors shrink-0 mr-[-2px]"
                    >
                      <X size={14} weight="bold" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <Button 
                isIconOnly 
                variant="ghost" 
                onClick={handleGeolocateUser} 
                className="h-10 w-10 md:h-12 md:w-12 rounded-[1.25rem] text-falla-ink bg-falla-paper ink-border shadow-solid-sm transition-all shrink-0 border-2 active:scale-95"
              >
                <Target size={22} weight="bold" />
              </Button>
            </div>

            <div className="flex items-center justify-between px-1 pb-1 pt-2 md:pt-3 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-falla-ink/10 dark:bg-white/10" />
              <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center w-full">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'events', label: 'Events', icon: <CalendarBlank size={12} weight="fill" /> },
                  { id: 'special', label: 'Special', icon: <Star size={12} weight="fill" /> },
                  { id: 'liked', label: 'Liked', icon: <Heart size={12} weight="fill" /> },
                  { id: 'visited', label: 'Visited', icon: <CheckCircle size={12} weight="fill" /> }
                ].map((mode) => (
                  <Button 
                    key={mode.id}
                    size="sm" 
                    variant={filterMode === mode.id ? 'default' : 'ghost'} 
                    onClick={() => setFilterMode(mode.id as any)}
                    startContent={mode.icon}
                    className={cn(
                      "h-8 md:h-9 rounded-full px-3 md:px-4 text-[9px] md:text-[11px] font-black uppercase transition-all flex-grow sm:flex-grow-0 min-w-0 active:scale-95", 
                      filterMode === mode.id ? "bg-falla-fire text-falla-paper shadow-none border-falla-fire" : "text-falla-ink/40 hover:bg-falla-ink/5"
                    )}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSearchFocused && autocompleteResults.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative z-10 bg-transparent"
              >
                <div className="flex flex-col max-h-[40vh] overflow-y-auto scrollbar-hide py-2">
                  {autocompleteResults.map((result) => {
                    const regex = new RegExp(`(${searchQuery})`, 'gi');
                    const parts = result.name.split(regex);
                    const key = result.number || result.id || result.name;
                    
                    return (
                      <button
                        key={key}
                        onClick={() => handleAutocompleteClick(result)}
                        className="w-full px-6 py-3 md:py-4 flex items-center justify-between hover:bg-falla-ink/5 dark:hover:bg-white/5 transition-all group relative bg-transparent border-none active:scale-[0.98] gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-falla-ink/5 dark:bg-white/5 flex items-center justify-center font-display text-lg text-falla-fire group-hover:scale-110 transition-all shrink-0">
                            {result.is_hub ? <CalendarBlank size={20} weight="bold" /> : `#${result.number}`}
                          </div>
                          <div className="text-left overflow-hidden flex-1">
                            <p className="font-bold text-sm text-falla-ink leading-none mb-1 truncate transition-colors">
                              {parts.map((part: string, i: number) => 
                                regex.test(part) 
                                  ? <span key={i} className="text-falla-fire">{part}</span> 
                                  : <span key={i} className="opacity-80 group-hover:opacity-100">{part}</span>
                              )}
                            </p>
                            <p className="text-[10px] font-black uppercase text-falla-ink/40 tracking-widest truncate">
                              {result.is_hub ? 'Official Event Location' : result.is_special ? 'Special Section' : 'Monument'}
                            </p>
                          </div>
                        </div>
                        <div className="w-6 flex justify-end shrink-0">
                          {result.number && visitedNumbers.includes(result.number) && (
                            <CheckCircle size={20} weight="fill" className="text-falla-sage drop-shadow-sm" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && handleDrawerClose()} shouldScaleBackground autoFocus={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100]" />
          <Drawer.Content className="bg-transparent flex flex-col fixed bottom-0 left-0 right-0 z-[101] outline-none items-center justify-center pointer-events-none md:p-8 h-[100dvh]">
            <Drawer.Title className="sr-only">POI Details</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-falla-ink/10 my-4 md:hidden pointer-events-auto" />
            
            <motion.div 
              layoutId="poi-card"
              className="w-full h-full md:max-w-5xl bg-falla-paper rounded-t-[3rem] md:rounded-[3rem] border-x-2 border-t-2 md:border-2 border-falla-ink shadow-solid flex flex-col overflow-hidden pointer-events-auto relative"
            >
              {selectedPOI && (
                <div className="flex-1 overflow-hidden">
                  <FallaDetails 
                    falla={selectedPOI as any} 
                    onNext={() => {
                      const idx = allPOIs.findIndex(p => (p.number || p.id) === (selectedPOI.number || selectedPOI.id));
                      const next = allPOIs[(idx + 1) % allPOIs.length];
                      if (next.number) setSearchParams({ falla: next.number }, { replace: true });
                      else setSearchParams({ hub: next.id as string }, { replace: true });
                    }}
                    onPrev={() => {
                      const idx = allPOIs.findIndex(p => (p.number || p.id) === (selectedPOI.number || selectedPOI.id));
                      const prev = allPOIs[(idx - 1 + allPOIs.length) % allPOIs.length];
                      if (prev.number) setSearchParams({ falla: prev.number }, { replace: true });
                      else setSearchParams({ hub: prev.id as string }, { replace: true });
                    }}
                    onClose={handleDrawerClose}
                    onInteraction={refreshInteractions}
                  />
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
