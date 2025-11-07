import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
  darkMode: ["selector"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  safelist: [
    "text-chart-4",
    "bg-chart-4",
    "text-chart-5",
    "bg-chart-5",
    "text-chart-9",
    "bg-chart-9",
    "text-chart-12",
    "bg-chart-12",
    "text-primary",
    "bg-primary",
    "text-placeholder",
    "bg-placeholder",
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
        heading: "var(--font-lock-sans-stencil)",
        body: "var(--font-lock-sans)",
      },
      fontSize: {
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
      colors: {
        border: "hsla(var(--border))",
        input: "hsla(var(--input))",
        ring: "hsla(var(--ring))",
        background: "hsla(var(--background))",
        foreground: "hsla(var(--foreground))",
        primary: {
          DEFAULT: "hsla(var(--primary))",
          foreground: "hsla(var(--primary-foreground))",
          light: "hsla(var(--primary-light))",
          dark: "hsla(var(--primary-dark))",
          visited: "hsla(var(--primary-visited))",
          border: "hsla(var(--primary-border))",
        },
        secondary: {
          DEFAULT: "hsla(var(--secondary))",
          foreground: "hsla(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsla(var(--destructive))",
          foreground: "hsla(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsla(var(--muted))",
          foreground: "hsla(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsla(var(--accent))",
          foreground: "hsla(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsla(var(--popover))",
          foreground: "hsla(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsla(var(--card))",
          foreground: "hsla(var(--card-foreground))",
        },
        brand: {
          secondary: "hsla(var(--brand-secondary))",
          "secondary-foreground": "hsla(var(--brand-secondary-foreground))",
        },
        success: {
          DEFAULT: "hsla(var(--success))",
          foreground: "hsla(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsla(var(--warning))",
          foreground: "hsla(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsla(var(--info))",
          foreground: "hsla(var(--info-foreground))",
        },
        chart: {
          "1": "hsla(var(--chart-1))",
          "2": "hsla(var(--chart-2))",
          "3": "hsla(var(--chart-3))",
          "4": "hsla(var(--chart-4))",
          "5": "hsla(var(--chart-5))",
          "6": "hsla(var(--chart-6))",
          "7": "hsla(var(--chart-7))",
          "8": "hsla(var(--chart-8))",
          "9": "hsla(var(--chart-9))",
          "10": "hsla(var(--chart-10))",
          "11": "hsla(var(--chart-11))",
          "12": "hsla(var(--chart-12))",
          "13": "hsla(var(--chart-13))",
          "14": "hsla(var(--chart-14))",
          "15": "hsla(var(--chart-15))",
          "16": "hsla(var(--chart-16))",
          "17": "hsla(var(--chart-17))",
          border: "hsla(var(--chart-border))",
        },
        sidebar: {
          DEFAULT: "hsla(var(--sidebar))",
          foreground: "hsla(var(--sidebar-foreground))",
          primary: "hsla(var(--sidebar-primary))",
          "primary-foreground": "hsla(var(--sidebar-primary-foreground))",
          accent: "hsla(var(--sidebar-accent))",
          "accent-foreground": "hsla(var(--sidebar-accent-foreground))",
          border: "hsla(var(--sidebar-border))",
          ring: "hsla(var(--sidebar-ring))",
        },
        "background-highlight": "hsla(var(--background-highlight))",
        "background-active": "hsla(var(--background-active))",
        "background-accent": "hsla(var(--background-accent))",
        placeholder: "hsla(var(--placeholder))",
        level: {
          best: "hsla(var(--level-best))",
          middle: "hsla(var(--level-middle))",
          worst: "hsla(var(--level-worst))",
        },
        body: {
          DEFAULT: "hsla(var(--foreground))",
          secondary: "hsla(var(--muted-foreground))",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
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
        "progress-pulse": {
          "0%, 100%": {
            opacity: "0.5",
          },
          "50%": {
            opacity: "1",
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
        "progress-pulse": "progress-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
