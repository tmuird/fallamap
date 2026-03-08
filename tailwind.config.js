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
      fontSize: {
        'fluid-display': ['clamp(5.5rem, 22vw, 18rem)', { lineHeight: '0.75' }],
        'fluid-xl': ['clamp(3rem, 10vw, 6rem)', { lineHeight: '0.85' }],
        'fluid-2xl': ['clamp(4.5rem, 12vw, 10rem)', { lineHeight: '0.8' }],
      },
      colors: {
        falla: {
          paper: "var(--falla-paper)", 
          ink: "var(--falla-ink)",
          fire: "var(--falla-fire)",
          sage: "var(--falla-sage)",
          sand: "var(--falla-sand)",
        },
      },
      borderWidth: {
        '2.5': '2.5px',
      },
      boxShadow: {
        'solid': '3px 3px 0px 0px var(--falla-shadow)',
        'solid-lg': '5px 5px 0px 0px var(--falla-shadow)',
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
            background: "#FAF7F2",
            foreground: "#1A1A1A",
            primary: {
              DEFAULT: "#FF7043",
              foreground: "#FAF7F2",
            },
            secondary: {
              DEFAULT: "#8B9467",
              foreground: "#FAF7F2",
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
        dark: {
          colors: {
            background: "#1A1A1A",
            foreground: "#FAF7F2",
            primary: {
              DEFAULT: "#FF7043",
              foreground: "#FAF7F2",
            },
            secondary: {
              DEFAULT: "#8B9467",
              foreground: "#FAF7F2",
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
        }
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
