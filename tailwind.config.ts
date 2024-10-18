import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        monospace: "var(--font-ibm-plex-mono)",
      },
      colors: {
        background: {
          DEFAULT: "hsla(var(--background))",
          highlight: "hsla(var(--background-highlight))",
        },
        primary: {
          DEFAULT: "hsla(var(--primary))",
          dark: "hsla(var(--primary-dark))",
        },
        body: {
          DEFAULT: "hsla(var(--body))",
          secondary: "hsla(var(--body-secondary))",
        },

        border: "hsla(var(--border))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
