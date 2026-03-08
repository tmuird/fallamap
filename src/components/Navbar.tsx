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
  Button,
} from "@heroui/react";
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
  ];

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Modern floating navbar design
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out px-4 md:px-8 pointer-events-none",
      scrolled ? "pt-3 md:pt-5" : "pt-6 md:pt-10"
    )}>
      <Navbar 
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen} 
        maxWidth="xl" 
        className={cn(
          "transition-all duration-500 ease-in-out border-2 border-falla-ink rounded-[2.5rem] h-16 md:h-20 shadow-solid pointer-events-auto",
          scrolled ? "bg-falla-paper/95 backdrop-blur-xl" : "bg-falla-paper/80 backdrop-blur-md"
        )}
        classNames={{
          wrapper: "px-4 md:px-10 max-w-full",
          toggle: "w-11 h-11 flex items-center justify-center rounded-xl ink-border bg-falla-paper shadow-solid-sm active:shadow-none transition-all p-0",
        }}
      >
        <NavbarContent className="gap-6">
          <NavbarMenuToggle
            icon={isMenuOpen ? <X size={26} weight="bold" className="text-falla-ink" /> : <List size={26} weight="bold" className="text-falla-ink" />}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <Link to="/" className="flex items-center gap-4 group" onClick={handleMenuClose}>
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.15 }}
                className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center relative transition-transform"
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
              <p className="font-display text-xl md:text-3xl text-falla-fire hidden md:block leading-none tracking-tighter lowercase">
                fallamap
              </p>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-8 md:gap-12" justify="center">
          {menuItems.map((item, index) => (
            <NavbarItem key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "text-xs md:text-sm font-black uppercase tracking-[0.3em] transition-all hover:text-falla-fire flex items-center gap-2 italic relative group",
                    isActive ? "text-falla-fire" : "text-falla-ink/40"
                  )
                }
              >
                {item.label}
                <AnimatePresence>
                  {location.pathname === item.path && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-falla-fire rounded-full"
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

        <NavbarContent justify="end" className="gap-3 md:gap-6">
          <NavbarItem className="gap-3 md:gap-4 flex items-center">
            <div className="scale-90 md:scale-110">
              <ThemeSwitcher />
            </div>
            
            <Show when="signed-in">
              <div className="flex items-center gap-3 md:gap-4">
                <Link to="/profile">
                  <Button 
                    variant="flat" 
                    size="sm" 
                    className="bg-falla-paper text-falla-ink font-bold uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl px-3 md:px-5 h-9 md:h-11 ink-border shadow-solid-sm hover:shadow-none transition-all border-2 hidden md:flex"
                    startContent={<Fingerprint size={18} weight="bold" className="text-falla-fire" />}
                  >
                    Journey
                  </Button>
                </Link>
                
                {isAdmin && (
                  <Link to="/dashboard" className="hidden lg:block">
                    <Button 
                      variant="flat" 
                      size="sm" 
                      className="bg-falla-ink text-falla-paper font-bold uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl px-3 md:px-5 h-9 md:h-11 ink-border shadow-solid-sm hover:shadow-none transition-all border-2"
                      startContent={<ShieldCheck size={18} weight="bold" />}
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="ink-border rounded-full p-1 bg-falla-paper shadow-solid-sm border-2 overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                  <UserButton 
                    appearance={{ 
                      elements: { 
                        userButtonAvatarBox: "w-7 h-7 md:w-8 md:h-8",
                        userButtonTrigger: "focus:shadow-none focus:ring-0" 
                      } 
                    }}
                  />
                </div>
              </div>
            </Show>
            <Show when="signed-out">
              <Link to="/sign-in">
                <Button 
                  variant="light" 
                  size="sm" 
                  className="text-falla-ink font-black uppercase tracking-widest text-[9px] md:text-[10px] h-9 md:h-11"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button 
                  size="sm" 
                  className="bg-falla-fire text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] rounded-xl px-4 md:px-6 h-9 md:h-11 ink-border shadow-solid active:shadow-none transition-all border-2"
                >
                  Join
                </Button>
              </Link>
            </Show>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="pt-32 bg-falla-paper/98 backdrop-blur-2xl border-t-2 border-falla-ink/5 rounded-b-[3rem] mx-4 shadow-solid-lg border-x-2 border-b-2 overflow-hidden">
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`} className="px-6">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "w-full text-5xl md:text-7xl font-display uppercase tracking-tighter py-6 md:py-8 block transition-all flex items-center gap-6 italic",
                    isActive ? "text-falla-fire translate-x-4 scale-105" : "text-falla-ink opacity-30"
                  )
                }
                onClick={handleMenuClose}
              >
                {item.label}
              </NavLink>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className="px-6 border-t border-falla-ink/10 mt-6 pt-6">
            <NavLink
              to="/profile"
              className="w-full text-5xl md:text-7xl font-display uppercase tracking-tighter py-6 md:py-8 block transition-all flex items-center gap-6 text-falla-ink opacity-30 italic"
              onClick={handleMenuClose}
            >
              Journey
            </NavLink>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </div>
  );
}
