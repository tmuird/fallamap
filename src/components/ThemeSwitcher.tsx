// components/ThemeSwitcher.tsx
import { useTheme } from "../context/ThemeContext"; // Adjust the import path as needed

export const ThemeSwitcher = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} style={{ cursor: "pointer" }}>
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
};
