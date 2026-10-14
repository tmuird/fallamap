import { useState, useEffect, useRef } from "react";
import { Show, UserButton, useUser } from "@clerk/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import { NavLink, Link, useLocation } from "react-router-dom";
import { 
  House, 
  MapTrifold, 
  CalendarBlank, 
  Archive, 
  Fingerprint,
  ShieldCheck
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { advanceNavbarScrollState, createNavbarScrollState } from "@/lib/navbarScroll";
import { SITE } from "@/lib/siteConfig";

/**
 * Frosted-surface rules (flicker fix, T2.14):
 * - Exactly ONE element may carry `backdrop-filter` in the navbar. Nesting two
 *   (HeroUI's own `backdrop-blur` inside our pill) forces the browser to re-rasterise
 *   the backdrop twice per frame while the page scrolls, which reads as a flicker.
 * - The element that carries the frosting must not also be CSS-transitioned on
 *   `all`: the hide/show animation is owned by framer-motion, and a CSS transition on
 *   the same transform/opacity fights it frame-by-frame.
 * - Nothing on the scroll path may change layout (the old `pt-*` swap on `scrolled`
 *   re-laid-out the blurred pill on every threshold crossing).
 */
const NAVBAR_FROSTED_SURFACE = "backdrop-blur-xl";
const NAVBAR_NO_NESTED_BLUR = { backdropFilter: "none", WebkitBackdropFilter: "none" } as const;
/** Taller than the pill (max ~118px incl. padding) so nothing peeks when hidden. */
const NAVBAR_HIDE_OFFSET = 140;

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollState = useRef(createNavbarScrollState());

  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => {
    scrollState.current = createNavbarScrollState(window.scrollY);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      const nextState = advanceNavbarScrollState(scrollState.current, currentScrollY, isMenuOpen);
      scrollState.current = nextState;
      setIsVisible(nextState.visible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  const menuItems = [
    { label: SITE.nav.home, path: "/", icon: <House size={20} weight="bold" /> },
    { label: SITE.nav.map, path: "/map", icon: <MapTrifold size={20} weight="bold" /> },
    { label: SITE.nav.program, path: "/schedule", icon: <CalendarBlank size={20} weight="bold" /> },
    { label: SITE.nav.archive, path: "/archive", icon: <Archive size={20} weight="bold" /> },
    { label: SITE.nav.journey, path: "/profile", icon: <Fingerprint size={20} weight="bold" /> },
  ];

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ 
        y: isVisible || isMenuOpen ? 0 : -NAVBAR_HIDE_OFFSET,
        opacity: isVisible || isMenuOpen ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] px-2 md:px-12 pt-3 md:pt-8 pointer-events-none flex flex-col items-center transform-gpu"
    >
      {/* Unified Custom Wrapper for Seamless Aesthetic */}
      {/* Frosting lives in this ONE element (see NAVBAR_FROSTED_SURFACE); animating or
          double-stacking backdrop-filter is what made the pill flicker on scroll. */}
      <motion.div 
        className={cn(
          "w-full transition-colors duration-200 ease-out shadow-solid pointer-events-auto flex flex-col overflow-hidden relative border-2 border-falla-ink rounded-[1.5rem] md:rounded-[2.5rem]",
          NAVBAR_FROSTED_SURFACE,
          scrolled || isMenuOpen ? "bg-falla-paper/95" : "bg-falla-paper/80"
        )}
      >
        <Navbar 
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen} 
          maxWidth="full" 
          className="bg-transparent h-14 md:h-20"
          style={NAVBAR_NO_NESTED_BLUR}
          classNames={{
            wrapper: "px-2 md:px-8 gap-1 md:gap-4 bg-transparent",
          }}
        >
          <NavbarContent className="gap-1 md:gap-4 flex-shrink-0" justify="start">
            {/* Mobile Menu Toggle - Left */}
            <Button
              isIconOnly
              variant="neutral"
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full ink-border bg-falla-paper shadow-solid-sm active:shadow-none transition-all p-0 flex-shrink-0 relative overflow-hidden border-2"
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(50);
                setIsMenuOpen(!isMenuOpen);
              }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="flex flex-col gap-1 items-center justify-center">
                <motion.div 
                  animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="w-5 h-0.5 bg-falla-ink rounded-full"
                />
                <motion.div 
                  animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 0 }}
                  className={cn("w-5 h-0.5 bg-falla-ink rounded-full", isMenuOpen ? "" : "w-3 ml-auto")}
                />
              </div>
            </Button>

            {/* Desktop Brand */}
            <NavbarBrand className="hidden sm:flex flex-shrink-0 w-auto">
              <Link to="/" className="flex items-center gap-1.5 md:gap-4 group" onClick={handleMenuClose}>
                <motion.div 
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 md:w-11 md:h-11 flex items-center justify-center relative transition-transform flex-shrink-0"
                >
                  <svg width="32" height="36" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                    <path 
                      d="M60 135C90 135 110 110 110 80C110 40 85 10 60 5C35 10 10 40 10 80C10 110 30 135 60 135Z" 
                      fill="var(--falla-fire)" 
                      stroke="var(--falla-ink)" 
                      strokeWidth="8"
                    />
                    <path 
                      d="M60 115C75 115 85 100 85 85C85 65 70 50 60 45C50 50 35 65 35 85C35 100 45 115 60 115Z" 
                      fill="#FFB600" 
                      stroke="var(--falla-ink)" 
                      strokeWidth="6"
                    />
                  </svg>
                </motion.div>
                <p className="font-display text-base md:text-3xl text-falla-fire-ink leading-none lowercase flex-shrink-0">
                  {SITE.brand.name}
                </p>
              </Link>
            </NavbarBrand>
          </NavbarContent>

          {/* Mobile Center Brand - No Flame */}
          <NavbarContent className="sm:hidden" justify="center">
            <p className="font-display text-2xl text-falla-fire-ink leading-none lowercase select-none">
              {SITE.brand.name}
            </p>
          </NavbarContent>

          {/* Desktop Nav */}
          <NavbarContent className="hidden sm:flex gap-2 md:gap-8 lg:gap-12 flex-shrink min-w-0" justify="center">
            {menuItems.filter(item => !["/", "/profile"].includes(item.path)).map((item, index) => (
              <NavbarItem key={index} className="flex-shrink min-w-0">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    cn(
                      "text-[10px] md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.3em] transition-all hover:text-falla-fire-ink flex items-center gap-1 md:gap-2 relative group py-1 md:py-2 whitespace-nowrap",
                      isActive ? "text-falla-fire-ink" : "text-falla-ink/65"
                    )
                  }
                  onClick={() => { if (navigator.vibrate) navigator.vibrate(30); }}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.icon}</span>
                  <AnimatePresence>
                    {location.pathname === item.path && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-falla-fire rounded-full"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                      />
                    )}
                  </AnimatePresence>
                </NavLink>
              </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent justify="end" className="gap-2 md:gap-4 flex-grow-0">
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <ThemeSwitcher />
              
              <Show when="signed-in">
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <Link to="/profile" className="hidden sm:flex flex-shrink-0" onClick={() => { if (navigator.vibrate) navigator.vibrate(30); }}>
                    <Button
                      variant="neutral"
                      size="sm"
                      isIconOnly
                      className="w-8 h-8 flex-shrink-0 rounded-full border-2 active:scale-95 shadow-solid-sm hover:shadow-none transition-all"
                      aria-label="Journey"
                    >
                      <Fingerprint size={16} weight="bold" className="text-falla-fire-ink" />
                    </Button>
                  </Link>

                  {isAdmin && (
                    <Link to="/dashboard" className="hidden sm:flex flex-shrink-0" onClick={() => { if (navigator.vibrate) navigator.vibrate(30); }}>
                      <Button
                        variant="default"
                        size="sm"
                        isIconOnly
                        className="w-8 h-8 flex-shrink-0 rounded-full border-2 active:scale-95 shadow-solid-sm hover:shadow-none transition-all"
                        aria-label="Admin"
                      >
                        <ShieldCheck size={16} weight="bold" />
                      </Button>
                    </Link>
                  )}
                  
                  {/* Profile Pill Wrapper */}
                  <div className="rounded-full p-0.5 md:p-1 bg-falla-paper shadow-solid-sm border-2 border-falla-ink overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer flex items-center justify-center h-8 w-8 md:h-11 md:w-11 flex-shrink-0 active:scale-95">
                    <UserButton 
                      appearance={{ 
                        elements: { 
                          userButtonAvatarBox: "w-6 h-6 md:w-8 md:h-8",
                          userButtonTrigger: "focus:shadow-none focus:ring-0" 
                        } 
                      }}
                    />
                  </div>
                </div>
              </Show>
              <Show when="signed-out">
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <Link to="/sign-in" className="flex-shrink-0" onClick={() => { if (navigator.vibrate) navigator.vibrate(30); }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-falla-ink font-black uppercase tracking-widest text-[8px] md:text-[10px] h-8 md:h-11 px-1.5 md:px-4 flex-shrink-0 active:scale-95"
                    >
                      {SITE.nav.signIn}
                    </Button>
                  </Link>
                  <Link to="/sign-up" className="flex-shrink-0" onClick={() => { if (navigator.vibrate) navigator.vibrate(30); }}>
                    <Button 
                      size="sm" 
                      className="bg-falla-fire text-falla-on-fire font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-lg md:rounded-xl px-2 md:px-8 h-8 md:h-11 ink-border shadow-solid active:shadow-none transition-all border-1.5 md:border-2 flex-shrink-0 active:scale-95"
                    >
                      {SITE.nav.join}
                    </Button>
                  </Link>
                </div>
              </Show>
            </div>
          </NavbarContent>
        </Navbar>

        {/* Custom Menu - Completely eliminates border artifacts */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col z-40 bg-transparent"
            >
              <div className="flex flex-col gap-2 px-4 py-8 relative">

                {menuItems.map((item, index) => (
                  <NavLink
                    key={`${item.label}-${index}`}
                    to={item.path}
                    className={({ isActive }) => 
                      cn(
                        "w-full text-4xl md:text-6xl font-display uppercase py-3 md:py-4 transition-all flex items-center gap-4 rounded-2xl px-4",
                        isActive ? "text-falla-fire-ink bg-falla-fire/5 translate-x-2" : "text-falla-ink/65 hover:text-falla-ink/70 hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]"
                      )
                    }
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(30);
                      handleMenuClose();
                    }}
                  >
                    <span className="shrink-0 opacity-50">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
