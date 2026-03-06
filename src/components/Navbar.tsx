import { cn } from "@/utils/cn";
import { useState } from "react";
import { Show, UserButton } from "@clerk/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({
    name: "English",
    flag: "🇬🇧",
  });

  const menuItems = [
    { label: "Map", path: "/" },
    { label: "Schedule", path: "/schedule" },
    { label: "Contact", path: "/contact" },
  ];

  const languages = [
    { name: "English", flag: "🇬🇧" },
    { name: "Spanish", flag: "🇪🇸" },
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      maxWidth="xl" 
      className="bg-falla-paper/90 backdrop-blur-sm border-b-2 border-falla-ink sticky top-0"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-falla-fire rounded-full ink-border flex items-center justify-center">
              <span className="text-sm">🔥</span>
            </div>
            <p className="font-black text-xl tracking-tight text-falla-ink">
              FALLA<span className="text-falla-fire">MAP</span>
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
                  "text-xs font-bold uppercase tracking-widest transition-all hover:text-falla-fire",
                  isActive ? "text-falla-fire" : "text-falla-ink/60"
                )
              }
            >
              {item.label}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="light" size="sm" isIconOnly className="font-bold">
                {currentLanguage.flag}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Language selection"
              onAction={(key) => {
                const lang = languages.find(l => l.name === key);
                if (lang) setCurrentLanguage(lang);
              }}
            >
              {languages.map((lang) => (
                <DropdownItem key={lang.name} startContent={<span>{lang.flag}</span>} className="font-bold">
                  {lang.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        <NavbarItem className="gap-2 flex">
          <Show when="signed-in">
            <Button 
              as={Link} 
              to="/dashboard" 
              variant="flat" 
              size="sm" 
              className="bg-falla-ink text-falla-paper font-bold uppercase tracking-tighter text-[10px] rounded-xl px-4"
              startContent={<LayoutDashboard className="w-3 h-3" />}
            >
              Admin
            </Button>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Button 
              as={Link} 
              to="/sign-in" 
              variant="light" 
              size="sm" 
              className="text-falla-ink font-bold uppercase tracking-tighter text-[10px]"
            >
              Sign In
            </Button>
            <Button 
              as={Link} 
              to="/sign-up" 
              size="sm" 
              className="bg-falla-ink text-falla-paper font-bold uppercase tracking-tighter text-[10px] rounded-xl px-4 ink-border soft-shadow hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
            >
              Join
            </Button>
          </Show>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="pt-10 bg-falla-paper">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "w-full text-3xl font-black uppercase tracking-tight py-4 block",
                  isActive ? "text-falla-fire" : "text-falla-ink"
                )
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
