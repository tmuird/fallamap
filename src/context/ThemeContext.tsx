// context/ThemeContext.tsx
import React, {
 createContext,
 useContext,
 useState,
 useEffect,
 ReactNode,
} from "react";

// Define the shape of the context data
type ThemeContextType = {
 isDarkMode: boolean;
 toggleTheme: () => void;
};

// Create the context with an undefined default value
export const ThemeContext = createContext<ThemeContextType | undefined>(
 undefined,
);

// Props type for ThemeProvider, specifying that it expects children
type ThemeProviderProps = {
 children: ReactNode;
};

// ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
 // State to keep track of whether dark mode is enabled
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
  // Default to light mode (false)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme === "dark";
  return false;
 });

 // Effect hook to listen for changes to the system theme preference
 useEffect(() => {
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
 }, [isDarkMode]);

 // Function to toggle the theme
 const toggleTheme = () => {
  setIsDarkMode(!isDarkMode);
 };

 return (
  <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
   {children}
  </ThemeContext.Provider>
 );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
 const context = useContext(ThemeContext);
 if (context === undefined) {
  throw new Error("useTheme must be used within a ThemeProvider");
 }
 return context;
};
