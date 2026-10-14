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
        'fluid-display': ['clamp(2.5rem, 8vw, 6rem)', { lineHeight: '0.8' }],
        'fluid-lg': ['clamp(1.5rem, 4vw, 2.5rem)', { lineHeight: '1' }],
        'fluid-xl': ['clamp(1.75rem, 5vw, 3rem)', { lineHeight: '0.9' }],
        'fluid-2xl': ['clamp(2.25rem, 7vw, 4.5rem)', { lineHeight: '0.85' }],
      },
      colors: {
        // NOTE: these must stay channel-triplet based (`rgb(var(--x-rgb) / <alpha-value>)`).
        // Defining them as raw hex/`var()` silently breaks EVERY `/opacity` utility
        // (bg-falla-paper/95, text-falla-ink/40, border-falla-ink/5 …) — they compile to
        // nothing, which flattens the type hierarchy, drops tints and turns hairline
        // borders into Tailwind's default gray. The `-rgb` vars live in globals.css.
        falla: {
          paper: "rgb(var(--falla-paper-rgb) / <alpha-value>)",
          ink: "rgb(var(--falla-ink-rgb) / <alpha-value>)",
          fire: "rgb(var(--falla-fire-rgb) / <alpha-value>)",
          sage: "rgb(var(--falla-sage-rgb) / <alpha-value>)",
          sand: "rgb(var(--falla-sand-rgb) / <alpha-value>)",
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
    // The `falla` palette resolves to `rgb(var(--…-rgb) / <alpha-value>)`; emitting that
    // as a literal custom property would produce an invalid value and shadow the real
    // hex/`-rgb` variables declared in globals.css. Those keys are owned there.
    Object.entries(allColors)
      .filter(([key]) => !key.startsWith("falla-"))
      .map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
