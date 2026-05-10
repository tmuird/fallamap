import { useState, useEffect, useRef } from "react";
import { useUser, UserButton } from "@clerk/react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Scissors, List, X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { label: "Browse", path: "/browse" },
  { label: "How it works", path: "/#how-it-works" },
];

export default function MarketplaceNavbar() {
  const { isSignedIn }              = useUser();
  const [scrolled, setScrolled]     = useState(false);
  const [isVisible, setIsVisible]   = useState(true);
  const [menuOpen, setMenuOpen]     = useState(false);
  const lastScrollY                 = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y > lastScrollY.current && y > 100 && !menuOpen) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      if (y < 10) setIsVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isVisible || menuOpen ? 0 : -140, opacity: isVisible || menuOpen ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-3 md:px-8 pointer-events-none flex flex-col items-center transition-all duration-500",
        scrolled ? "pt-2 md:pt-4" : "pt-4 md:pt-8"
      )}
    >
      {/* Main bar */}
      <div className={cn(
        "w-full max-w-6xl pointer-events-auto transition-all duration-500",
        "bg-falla-paper/90 backdrop-blur-md border-2 border-falla-ink rounded-2xl px-4 py-3",
        "flex items-center justify-between gap-4",
        scrolled ? "shadow-solid" : ""
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-falla-fire rounded-xl border-2 border-falla-ink flex items-center justify-center shadow-solid-sm group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
            <Scissors size={15} weight="bold" className="text-white" />
          </div>
          <span className="font-display text-2xl tracking-widest text-falla-fire">craftly</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                isActive
                  ? "bg-falla-ink text-falla-paper"
                  : "text-falla-ink/70 hover:text-falla-ink hover:bg-falla-ink/5"
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeSwitcher />
          {!isSignedIn && (
            <Link to="/sign-in" className="hidden md:block">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          )}
          <Link to="/request/new" className="hidden md:block">
            <Button size="sm">Post a Request</Button>
          </Link>
          {isSignedIn && <UserButton />}
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-xl border-2 border-falla-ink bg-falla-paper shadow-solid-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-6xl pointer-events-auto mt-2 bg-falla-paper border-2 border-falla-ink rounded-2xl shadow-solid p-4 flex flex-col gap-2"
          >
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => cn(
                  "px-4 py-3 rounded-xl font-bold text-sm transition-all",
                  isActive ? "bg-falla-ink text-falla-paper" : "text-falla-ink hover:bg-falla-ink/5"
                )}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="h-px bg-falla-ink/10 my-1" />
            <Link to="/sign-in" onClick={() => setMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Sign in</Button>
            </Link>
            <Link to="/request/new" onClick={() => setMenuOpen(false)}>
              <Button size="sm" className="w-full">Post a Request</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
