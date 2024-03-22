import React, { useState } from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Link,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@nextui-org/react";

export default function AppNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    // Initialize currentLanguage state
    const [currentLanguage, setCurrentLanguage] = useState({ name: "English", flag: "🇬🇧" });

    const menuItems = ["Profile", "Dashboard", "Map", "Contact Us", "Log Out"];

    const languages = [
        { name: "English", flag: "🇬🇧" },
        { name: "Spanish", flag: "🇪🇸" },
    ];

    const handleLanguageChange = (language) => {
        console.log("Language selected:", language);
        // Update the currentLanguage state based on selection
        const selectedLanguage = languages.find(lang => lang.name === language);
        if (selectedLanguage) {
            setCurrentLanguage(selectedLanguage);
        }
        // Here, you would also handle the logic to change the website's language
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
                {menuItems.slice(0, 4).map((item, index) => (
                    <NavbarItem key={index}>
                        <Link color="foreground" href="#">
                            {item}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>
            <NavbarContent justify="end">
                <Popover isOpen={visible} onOpenChange={setVisible}>
                    <PopoverTrigger>
                        <Button variant="Light" >
                            {currentLanguage.flag} {/* Display current language flag */}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        {languages.map((lang) => (
                            <NavbarItem key={lang.name}>
                                <Button
                                    variant={lang.name !== currentLanguage.name ? "solid    " : "flat"}
                                    onClick={() => handleLanguageChange(lang.name)}>

                                    {lang.flag}
                                </Button>
                            </NavbarItem>
                        ))}
                    </PopoverContent>
                </Popover>
                <NavbarItem className="hidden lg:flex">
                    <Link href="#">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link} color="primary" href="#" variant="flat">
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <Link
                            color={
                                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
                            }
                            className="w-full"
                            href="#"
                            size="lg"
                        >
                            {item}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}
