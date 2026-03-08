import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      isIconOnly
      variant="neutral"
      onClick={toggleTheme}
      className="w-8 h-8 md:w-11 md:h-11 rounded-xl border-1.5 md:border-2 shadow-solid-sm hover:shadow-none transition-all"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun size={18} weight="bold" className="text-yellow-400 md:scale-110" />
      ) : (
        <Moon size={18} weight="bold" className="text-falla-ink md:scale-110" />
      )}
    </Button>
  );
}
