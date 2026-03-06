import tailwindAnimate from "tailwindcss-animate";
import { heroui } from "@heroui/react";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bricolage Grotesque", "sans-serif"],
        display: ["Bricolage Grotesque", "sans-serif"],
      },
      colors: {
        falla: {
          paper: "#FDFBF7", 
          ink: "#1A1A1A",
          fire: "#FF5F1F",  // Brighter, tonal fire orange
          sage: "#6B705C",
          sand: "#E9E5D6",
        },
      },
      borderWidth: {
        '2.5': '2.5px',
      },
      boxShadow: {
        'solid': '3px 3px 0px 0px #1A1A1A',
        'solid-lg': '5px 5px 0px 0px #1A1A1A',
      },
    },
  },
  darkMode: "class",
  plugins: [
    tailwindAnimate,
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FDFBF7",
            foreground: "#1A1A1A",
            primary: {
              DEFAULT: "#FF5F1F",
              foreground: "#FDFBF7",
            },
            secondary: {
              DEFAULT: "#6B705C",
              foreground: "#FDFBF7",
            },
            focus: "#FF5F1F",
          },
          layout: {
            borderWidth: {
              small: "1.5px",
              medium: "2.5px",
              large: "3px",
            },
            radius: {
              small: "8px",
              medium: "14px",
              large: "28px",
            },
          }
        },
      },
    }),
    addVariablesForColors,
  ],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
