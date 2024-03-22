import  { useState } from "react";
import { SignedIn, SignedOut,  UserButton } from "@clerk/clerk-react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";
import { NavLink } from "react-router-dom";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  // Initialize currentLanguage state
  const [currentLanguage, setCurrentLanguage] = useState({
    name: "English",
    flag: "🇬🇧",
  });

  const menuItems = ["Home", "Calendar", "About", "Contact"];

  const languages = [
    { name: "English", flag: "🇬🇧" },
    { name: "Spanish", flag: "🇪🇸" },
  ];

  const handleLanguageChange = (language: string) => {
    console.log("Language selected:", language);
    // Update the currentLanguage state based on selection
    const selectedLanguage = languages.find((lang) => lang.name === language);
    if (selectedLanguage) {
      setCurrentLanguage(selectedLanguage);
    }
    // Here, you would also handle the logic to change the website's language
  };
  const getPathForMenuItem = (item: string) => {
    if (item === "Home") {
      return "/";
    } else {
      return `/${item.toLowerCase()}`;
    }
  };
  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit">Fallamap</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            {/* Wrap NavLink inside Next UI's Link component if you want to keep Next UI styling */}
            <NavLink
              to={getPathForMenuItem(item)}
              className={({ isActive }) => (isActive ? "activeLink" : "")}
              style={{ textDecoration: "none" }} // Example inline style
            >
              {item}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <Popover isOpen={visible} onOpenChange={setVisible}>
          <PopoverTrigger>
            <Button variant="light">
              {currentLanguage.flag} {/* Display current language flag */}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {languages.map((lang) => (
              <NavbarItem key={lang.name}>
                <Button
                  variant={
                    lang.name !== currentLanguage.name ? "solid" : "flat"
                  }
                  onClick={() => handleLanguageChange(lang.name)}
                >
                  {lang.flag}
                </Button>
              </NavbarItem>
            ))}
          </PopoverContent>
        </Popover>
       <NavbarItem>
         <SignedIn>
           <UserButton afterSignOutUrl='/sign-in' />
         </SignedIn>
         <SignedOut>
           <NavLink to="/sign-in">Sign In</NavLink>
         </SignedOut>
         
       </NavbarItem>
        <NavbarItem>
          <SignedOut>
            <NavLink to="/sign-up">Sign Up</NavLink>
          </SignedOut>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            {/* Wrap NavLink inside Next UI's Link component if you want to keep Next UI styling */}
            <NavLink
              to={getPathForMenuItem(item)}
              className={({ isActive }) => (isActive ? "activeLink" : "")}
              style={{ textDecoration: "none" }} // Example inline style
            >
              {item}
            </NavLink>
          </NavbarItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
