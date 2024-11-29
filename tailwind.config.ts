import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: "var(--font-ibm-plex-sans)",
        body: "var(--font-ibm-plex-sans)",
        mono: "var(--font-ibm-plex-mono)",
      },
      fontSize: {
        // Ex: "name": ["font-size", "line-height"]
        "6xl": ["4rem", "4.5rem"],
        "5xl": ["3.25rem", "4rem"],
        "4xl": ["2.75rem", "3.25rem"],
        "3xl": ["2rem", "2.375rem"],
        "2xl": ["1.5rem", "1.75rem"],
        xl: ["1.25rem", "1.75rem"],
        lg: ["1.125rem", "1.75rem"],
        base: ["1rem", "1.5rem"],
        sm: ["0.875rem", "1.375rem"],
        xs: ["0.75rem", "1.125rem"],
      },
      gridTemplateColumns: {
        "6-auto": "repeat(5, 1fr) auto",
      },
      colors: {
        background: {
          DEFAULT: "hsla(var(--background))",
          highlight: "hsla(var(--background-highlight))",
          active: "hsla(var(--background-active))",
        },
        primary: {
          DEFAULT: "hsla(var(--primary))",
          light: "hsla(var(--primary-light))",
          dark: "hsla(var(--primary-dark))",
          border: "hsla(var(--primary-border))",
        },
        body: {
          DEFAULT: "hsla(var(--body))",
          secondary: "hsla(var(--body-secondary))",
        },

        border: "hsla(var(--border))",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "heart-beat": {
          "0%, 25%": {
            transform: "scale(1.1)",
            animationTiming: "ease",
          },
          "24%, 49%": {
            transform: "scale(1)",
            animationTiming: "ease",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heart-beat": "heart-beat 1s infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
