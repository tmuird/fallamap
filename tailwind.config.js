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
        display: ["MatzyFood", "cursive"],
      },
      colors: {
        falla: {
          paper: "#FDFBF7", 
          ink: "#1A1A1A",
          fire: "#FF7043",
          sage: "#8B9467",
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
      animation: {
        scroll: "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
      },
      keyframes: {
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
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
              DEFAULT: "#FF7043",
              foreground: "#FDFBF7",
            },
            secondary: {
              DEFAULT: "#8B9467",
              foreground: "#FDFBF7",
            },
            focus: "#FF7043",
          },
          layout: {
            borderWidth: {
              small: "1.5px",
              medium: "2.5px",
              large: "3px",
            },
            radius: {
              small: "12px",
              medium: "20px",
              large: "9999px", 
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
