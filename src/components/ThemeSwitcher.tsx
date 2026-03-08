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
      className="w-9 h-9 rounded-xl border-2"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun size={20} weight="bold" className="text-yellow-400" />
      ) : (
        <Moon size={20} weight="bold" className="text-falla-ink" />
      )}
    </Button>
  );
}
