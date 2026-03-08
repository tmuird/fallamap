import { useState, useEffect } from "react";
import { Show, UserButton, useUser } from "@clerk/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import { NavLink, Link, useLocation } from "react-router-dom";
import { 
  House, 
  MapTrifold, 
  CalendarBlank, 
  List, 
  X, 
  Archive, 
  Fingerprint,
  ShieldCheck
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Home", path: "/", icon: <House size={20} weight="bold" /> },
    { label: "Map", path: "/map", icon: <MapTrifold size={20} weight="bold" /> },
    { label: "Schedule", path: "/schedule", icon: <CalendarBlank size={20} weight="bold" /> },
    { label: "Archive", path: "/archive", icon: <Archive size={20} weight="bold" /> },
    { label: "Journey", path: "/profile", icon: <Fingerprint size={20} weight="bold" /> },
  ];

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out px-2 md:px-12 pointer-events-none",
      scrolled ? "pt-2 md:pt-6" : "pt-4 md:pt-10",
      isMenuOpen && "px-2 pt-2 md:pt-6"
    )}>
      <Navbar 
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen} 
        maxWidth="full" 
        className={cn(
          "transition-all duration-500 ease-in-out border-2 border-falla-ink shadow-solid pointer-events-auto",
          scrolled || isMenuOpen ? "bg-falla-paper/95 backdrop-blur-xl" : "bg-falla-paper/80 backdrop-blur-md",
          isMenuOpen ? "rounded-t-[1.5rem] md:rounded-t-[2.5rem] rounded-b-none border-b-0 h-16 md:h-24" : "rounded-[1.5rem] md:rounded-[2.5rem] h-14 md:h-20"
        )}
        classNames={{
          wrapper: "px-2 md:px-8 gap-1 md:gap-4",
          toggle: "w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl ink-border bg-falla-paper shadow-solid-sm active:shadow-none transition-all p-0 flex-shrink-0",
        }}
      >
        <NavbarContent className="gap-1 md:gap-4 flex-shrink-0" justify="start">
          <NavbarMenuToggle
            icon={isMenuOpen ? <X size={20} weight="bold" className="text-falla-fire" /> : <List size={20} weight="bold" className="text-falla-ink" />}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand className="flex-shrink-0 w-auto">
            <Link to="/" className="flex items-center gap-1.5 md:gap-4 group" onClick={handleMenuClose}>
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.1 }}
                className="w-7 h-7 md:w-11 md:h-11 flex items-center justify-center relative transition-transform flex-shrink-0"
              >
                <svg width="32" height="36" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                  <path 
                    d="M60 135C90 135 110 110 110 80C110 40 85 10 60 5C35 10 10 40 10 80C10 110 30 135 60 135Z" 
                    fill="var(--falla-fire)" 
                    stroke="var(--falla-stroke)" 
                    strokeWidth="8"
                  />
                  <path 
                    d="M60 115C75 115 85 100 85 85C85 65 70 50 60 45C50 50 35 65 35 85C35 100 45 115 60 115Z" 
                    fill="#FFB600" 
                    stroke="var(--falla-stroke)" 
                    strokeWidth="6"
                  />
                </svg>
              </motion.div>
              <p className="font-display text-base md:text-3xl text-falla-fire hidden sm:block leading-none tracking-tighter lowercase flex-shrink-0">
                fallamap
              </p>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-2 md:gap-8 lg:gap-12 flex-shrink min-w-0" justify="center">
          {menuItems.filter(item => !["Home", "Journey"].includes(item.label)).map((item, index) => (
            <NavbarItem key={index} className="flex-shrink min-w-0">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "text-[10px] md:text-sm font-black uppercase tracking-[0.1em] md:tracking-[0.3em] transition-all hover:text-falla-fire flex items-center gap-1 md:gap-2 italic relative group py-1 md:py-2 whitespace-nowrap",
                    isActive ? "text-falla-fire" : "text-falla-ink/40"
                  )
                }
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
                <Link to="/profile" className="flex-shrink-0">
                  <Button 
                    variant="neutral" 
                    size="sm" 
                    isIconOnly
                    className="flex lg:hidden w-8 h-8 md:w-11 md:h-11 flex-shrink-0 rounded-full"
                    aria-label="Journey"
                  >
                    <Fingerprint size={16} weight="bold" className="text-falla-fire" />
                  </Button>
                  <Button 
                    variant="neutral" 
                    size="sm" 
                    className="hidden lg:flex px-3 md:px-6 h-9 md:h-11 ink-border shadow-solid-sm hover:shadow-none transition-all border-2 flex-shrink-0"
                    startContent={<Fingerprint size={18} weight="bold" className="text-falla-fire" />}
                  >
                    <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest">Journey</span>
                  </Button>
                </Link>
                
                {isAdmin && (
                  <Link to="/dashboard" className="flex-shrink-0">
                    <Button 
                      variant="default" 
                      size="sm" 
                      isIconOnly
                      className="flex xl:hidden w-8 h-8 md:w-11 md:h-11 flex-shrink-0 rounded-full"
                      aria-label="Admin"
                    >
                      <ShieldCheck size={16} weight="bold" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="hidden xl:flex px-3 md:px-6 h-9 md:h-11 ink-border shadow-solid-sm hover:shadow-none transition-all border-2 flex-shrink-0"
                      startContent={<ShieldCheck size={18} weight="bold" />}
                    >
                      <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest">Admin</span>
                    </Button>
                  </Link>
                )}
                
                {/* Profile Pill Wrapper */}
                <div className="rounded-full p-0.5 md:p-1 bg-falla-paper shadow-solid-sm border-2 border-falla-ink overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer flex items-center justify-center h-8 w-8 md:h-11 md:w-11 flex-shrink-0">
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
                <Link to="/sign-in" className="flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-falla-ink font-black uppercase tracking-widest text-[8px] md:text-[10px] h-8 md:h-11 px-1.5 md:px-4 flex-shrink-0"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up" className="flex-shrink-0">
                  <Button 
                    size="sm" 
                    className="bg-falla-fire text-white font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-lg md:rounded-xl px-2 md:px-8 h-8 md:h-11 ink-border shadow-solid active:shadow-none transition-all border-1.5 md:border-2 flex-shrink-0"
                  >
                    Join
                  </Button>
                </Link>
              </div>
            </Show>
          </div>
        </NavbarContent>

        <NavbarMenu className="pt-6 bg-falla-paper/95 backdrop-blur-xl border-x-2 border-b-2 border-t-0 border-falla-ink rounded-b-[1.5rem] md:rounded-b-[2.5rem] mx-0 shadow-solid-lg overflow-hidden flex flex-col gap-0 top-[-1px] h-fit pb-10 z-[110]">
          <div className="flex flex-col gap-0 px-2">
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.label}-${index}`} className="px-4 flex">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    cn(
                      "w-full text-4xl md:text-6xl font-display uppercase tracking-tighter py-3 md:py-4 transition-all flex items-center gap-4 italic",
                      isActive ? "text-falla-fire translate-x-2" : "text-falla-ink/30"
                    )
                  }
                  onClick={handleMenuClose}
                >
                  {item.label}
                </NavLink>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </Navbar>
    </div>
  );
}
