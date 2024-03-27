// components/ThemeSwitcher.tsx

import useDarkMode from "use-dark-mode";

export const ThemeSwitcher = () => {
  const darkMode = useDarkMode(false);

  // Toggle function to switch between dark and light mode
  const toggleTheme = () => {
    darkMode.value ? darkMode.disable() : darkMode.enable();
  };

  return (
    <button onClick={toggleTheme} style={{ cursor: "pointer" }}>
      {/* Dynamically changing icon or text */}
      {darkMode.value ? "🌙" : "☀️"}
    </button>
  );
};
