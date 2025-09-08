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
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        heading: "var(--font-lock-sans)", // TODO:TEAM - Unused?
        body: "var(--font-lock-sans)",
        mono: "var(--font-lock-sans)", // TODO:TEAM - Remove mono font?
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",

        /* shadcn */
        ring: "hsl(var(--ring))",
        background: "hsla(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          visited: "hsl(var(--primary-visited))",
          border: "hsla(var(--primary-border))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* Brand (emerald) */
        brand: {
          secondary: "hsl(var(--brand-secondary))",
          "secondary-foreground": "hsl(var(--brand-secondary-foreground))",
        },

        /* States */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },

        /* Typography */
        heading: "hsl(var(--heading))",
        "heading-sub": "hsl(var(--heading-sub))",
        subtitle: "hsl(var(--subtitle))",
        "body-text": "hsl(var(--body-text))",
        "body-muted": "hsl(var(--body-muted))",
        "label-foreground": "hsl(var(--label-foreground))",
        "caption-foreground": "hsl(var(--caption-foreground))",
        "code-foreground": "hsl(var(--code-foreground))",

        /* Charts */
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
          7: "hsl(var(--chart-7))",
          grid: "hsl(var(--chart-grid))",
          axis: "hsl(var(--chart-axis))",
          border: "hsl(var(--chart-border))",
        },

        /* Custom */
        sidebar: "hsl(var(--sidebar))",
        "background-highlight": "hsl(var(--background-highlight))",
        "background-active": "hsl(var(--background-active))",
        "background-accent": "hsl(var(--background-accent))",
        "background-modal": "hsl(var(--background-modal))",
        selection: "hsl(var(--selection))",
        focus: "hsl(var(--focus))",
        placeholder: "hsl(var(--placeholder))",

        /* Legacy compatibility (v2) */
        level: {
          best: "hsl(var(--level-best))",
          middle: "hsl(var(--level-middle))",
          worst: "hsl(var(--level-worst))",
        },
        body: {
          DEFAULT: "hsl(var(--body-text))", // Maps to new semantic token
          secondary: "hsl(var(--body-muted))", // Maps to new semantic token
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
