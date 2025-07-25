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
        "3xl": ["2.375rem", "2.875rem"],
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
          accent: "hsla(var(--background-accent))",
          modal: "hsla(var(--background-modal))",
        },
        primary: {
          DEFAULT: "hsla(var(--primary))",
          light: "hsla(var(--primary-light))",
          dark: "hsla(var(--primary-dark))",
          visited: "hsla(var(--primary-visited))",
          border: "hsla(var(--primary-border))",
        },
        body: {
          DEFAULT: "hsla(var(--body))",
          secondary: "hsla(var(--body-secondary))",
        },
        sidebar: {
          DEFAULT: "hsla(var(--sidebar))",
        },
        chart: {
          1: "hsla(var(--chart-1))",
          2: "hsla(var(--chart-2))",
          3: "hsla(var(--chart-3))",
          4: "hsla(var(--chart-4))",
          5: "hsla(var(--chart-5))",
          border: "hsla(var(--chart-border))",
        },
        level: {
          best: "hsla(var(--level-best))",
          middle: "hsla(var(--level-middle))",
          worst: "hsla(var(--level-worst))",
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
        "write-on-off": {
          "0%": {
            strokeDasharray: "100% 100%",
            strokeDashoffset: "-100%",
          },
          "100%": {
            strokeDasharray: "100% 100%",
            strokeDashoffset: "100%",
          },
        },
        "brownian-motion": {
          "0%": {
            transform: "translate(0, 0)",
          },
          "25%": {
            transform: "translate(-0.5px, -0.5px)",
          },
          "50%": {
            transform: "translate(0.5px, 0.5px)",
          },
          "75%": {
            transform: "translate(-0.5px, 0.5px)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(-5px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "success-pulse": {
          "0%": {
            opacity: "0.1",
          },
          "50%": {
            opacity: "0.2",
          },
          "100%": {
            opacity: "0.1",
          },
        },
        "success-ring": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0.2",
          },
          "100%": {
            transform: "scale(1.1)",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heart-beat": "heart-beat 1s infinite",
        "write-on-off": "write-on-off 2s ease-in-out infinite",
        brownian: "brownian-motion 0.2s infinite",
        "fade-in": "fade-in 0.3s forwards",
        "success-pulse": "success-pulse 1.2s ease-in-out 2 forwards",
        "success-ring": "success-ring 1s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
