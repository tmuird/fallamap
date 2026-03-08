import { useState } from "react";
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
import { NavLink, Link } from "react-router-dom";
import { 
  House, 
  MapTrifold, 
  CalendarBlank, 
  List, 
  X, 
  Archive, 
  User,
  Fingerprint,
  ShieldCheck
} from "@phosphor-icons/react";
import { cn } from "@/utils/cn";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();

  const isAdmin = user?.publicMetadata?.role === "admin";

  const menuItems = [
    { label: "Home", path: "/", icon: <House size={20} weight="bold" /> },
    { label: "Map", path: "/map", icon: <MapTrifold size={20} weight="bold" /> },
    { label: "Schedule", path: "/schedule", icon: <CalendarBlank size={20} weight="bold" /> },
    { label: "Archive", path: "/archive", icon: <Archive size={20} weight="bold" /> },
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      maxWidth="xl" 
      className="bg-[#FAF7F2] border-b-2 border-falla-ink sticky top-0 h-20"
      classNames={{
        wrapper: "px-4 md:px-8 max-w-full",
        toggle: "w-10 h-10 flex items-center justify-center rounded-xl ink-border bg-white soft-shadow active:shadow-none transition-all p-0",
      }}
    >
      <NavbarContent className="gap-4">
        <NavbarMenuToggle
          icon={isMenuOpen ? <X size={24} weight="bold" className="text-falla-ink" /> : <List size={24} weight="bold" className="text-falla-ink" />}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center relative group-hover:scale-110 transition-transform">
              <svg width="32" height="36" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M60 135C90 135 110 110 110 80C110 40 85 10 60 5C35 10 10 40 10 80C10 110 30 135 60 135Z" 
                  fill="#FF5F1F" 
                  stroke="#1A1A1A" 
                  strokeWidth="8"
                />
                <path 
                  d="M60 115C75 115 85 100 85 85C85 65 70 50 60 45C50 50 35 65 35 85C35 100 45 115 60 115Z" 
                  fill="#FFB600" 
                  stroke="#1A1A1A" 
                  strokeWidth="6"
                />
              </svg>
            </div>
            <p className="font-display text-2xl text-falla-fire hidden md:block leading-none tracking-tight">
              fallamap
            </p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "text-sm font-bold uppercase tracking-[0.2em] transition-all hover:text-falla-fire flex items-center gap-2",
                  isActive ? "text-falla-fire" : "text-falla-ink/60"
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4">
        <NavbarItem className="gap-3 flex items-center">
          <Show when="signed-in">
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  variant="flat" 
                  size="sm" 
                  className="bg-falla-ink text-[#FAF7F2] font-bold uppercase tracking-widest text-[10px] rounded-xl px-5 h-10 ink-border soft-shadow hover:shadow-none transition-all border-2 hidden md:flex"
                  startContent={<ShieldCheck size={16} weight="bold" />}
                >
                  Admin
                </Button>
              )}
              <div className="ink-border rounded-full p-0.5 bg-white soft-shadow border-2 overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                <UserButton 
                  appearance={{ 
                    elements: { 
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonTrigger: "focus:shadow-none focus:ring-0" 
                    } 
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My Journey"
                      labelIcon={<Fingerprint size={16} weight="bold" />}
                      href="/profile"
                    />
                    {isAdmin && (
                      <UserButton.Link
                        label="Moderation"
                        labelIcon={<ShieldCheck size={16} weight="bold" />}
                        href="/dashboard"
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </div>
          </Show>
          <Show when="signed-out">
            <Button 
              as={Link} 
              to="/sign-in" 
              variant="light" 
              size="sm" 
              className="text-falla-ink font-bold uppercase tracking-widest text-[10px] h-10"
            >
              Sign In
            </Button>
            <Button 
              as={Link} 
              to="/sign-up" 
              size="sm" 
              className="bg-falla-fire text-white font-bold uppercase tracking-widest text-[10px] rounded-xl px-6 h-10 ink-border soft-shadow hover:shadow-none transition-all border-2"
            >
              Join
            </Button>
          </Show>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="pt-12 bg-[#FAF7F2]/98 backdrop-blur-xl border-t-2 border-falla-ink">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`} className="px-4">
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "w-full text-5xl font-display uppercase tracking-tight py-6 block transition-all flex items-center gap-4",
                  isActive ? "text-falla-fire translate-x-2" : "text-falla-ink opacity-60"
                )
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem className="px-4 border-t border-falla-ink/5 mt-4 pt-4">
          <NavLink
            to="/profile"
            className="w-full text-5xl font-display uppercase tracking-tight py-6 block transition-all flex items-center gap-4 text-falla-ink opacity-60"
            onClick={() => setIsMenuOpen(false)}
          >
            <User size={40} weight="bold" /> Profile
          </NavLink>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
