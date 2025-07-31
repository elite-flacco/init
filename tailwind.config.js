/** @type {import('tailwindcss').Config} */
module.exports = {
  // Define where Tailwind should look for class names in your files
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Theme configuration
  theme: {
    extend: {
      // Adventure Awaits Color Palette - Travel-themed warm & inviting
      colors: {
        // 🌅 Sunset Orange (Primary) - Warm adventure spirit
        primary: {
          DEFAULT: "#FF6B35", // Sunset orange (adventurous, warm)
          light: "#FF8A5C", // Soft sunset
          dark: "#E55A2B", // Deep sunset
          50: "#FFF4F0",
          100: "#FFE8DC",
          200: "#FFD0B8",
          300: "#FFB089",
          400: "#FF8A5C",
          500: "#FF6B35",
          600: "#E55A2B",
          700: "#CC4A21",
          800: "#B33B17",
          900: "#99320D",
        },

        // 🌊 Deep Teal (Secondary) - Calming waters, adventure depth
        secondary: {
          DEFAULT: "#2A9D8F", // Deep teal
          light: "#52C4B5", // Light teal waves
          dark: "#21826F", // Ocean depth
          50: "#F0FFFE",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#2A9D8F",
          600: "#21826F",
          700: "#1A675A",
          800: "#134E4A",
          900: "#0D3B37",
        },

        // 🎯 Adventure Accent Colors
        accent: {
          DEFAULT: "#F4A261", // Warm sand/amber for highlights
          light: "#F7B582", // Light amber
          dark: "#E08E3E", // Golden bronze
        },

        // 🌸 Coral Pink - For special highlights and CTAs
        coral: {
          DEFAULT: "#E76F51", // Coral adventure
          light: "#ED8A73", // Soft coral
          dark: "#D85A3C", // Deep coral
        },

        // ✅ Semantic Colors (slightly softened for friendliness)
        success: {
          DEFAULT: "#10b981", // Emerald green
        },
        warning: {
          DEFAULT: "#facc15", // Warm yellow
        },
        error: {
          DEFAULT: "#ef4444", // Friendly red
        },
        info: {
          DEFAULT: "#3b82f6", // Sky blue
        },

        // 🏖️ Adventure Backgrounds - Warm, inviting travel vibes
        background: {
          DEFAULT: "#F7FAFC", // Warm off-white (like sand)
          muted: "#FFF8F0", // Soft cream (like morning light)
          soft: "#FEFCF7", // General UI background
          card: "#FFFFFF", // Card backgrounds
          pattern: "#FFF4F0", // Pattern overlay
        },

        // 🗺️ Adventure Text - Clear, readable, travel-friendly
        foreground: {
          DEFAULT: "#2D3748", // Deep charcoal (like adventure gear)
          secondary: "#4A5568", // Medium slate
          muted: "#718096", // Muted text
          dim: "#A0AEC0", // Dim text
          ghost: "#E2E8F0", // Ghost text
        },

        // 🧭 Adventure UI Elements
        border: {
          DEFAULT: "#E2E8F0", // Neutral border
          secondary: "#CBD5E1", // Soft border
          muted: "#F7FAFC", // Light background border
          warm: "#FFE8DC", // Warm border (primary tint)
        },
        ring: {
          DEFAULT: "#FF6B35", // Sunset orange focus
          secondary: "#2A9D8F", // Teal focus
          muted: "#CBD5E1", // Subtle focus
        },
      },

      // Adventure Typography - Modern, friendly, travel-ready
      fontFamily: {
        // Primary sans-serif with adventure personality
        sans: [
          "Outfit",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Display font for headings - bold and adventurous
        display: [
          "Outfit",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        // Body text - Clean and readable
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        // Monospace font stack
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },

      // Enhanced font sizes with better mobile scaling
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      lineHeight: {
        "extra-tight": "1.1",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          md: "2rem",
          lg: "3rem",
          xl: "4rem",
          "2xl": "5rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1400px",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
        160: "40rem",
        176: "44rem",
        192: "48rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        // 🌅 Adventure Glow Effects - Warm and inviting
        glow: "0 0 20px rgba(255, 107, 53, 0.25)", // sunset orange glow
        "glow-lg": "0 0 40px rgba(255, 107, 53, 0.3)", // large sunset glow
        "glow-teal": "0 0 24px rgba(42, 157, 143, 0.3)", // teal water glow
        "glow-coral": "0 0 16px rgba(231, 111, 81, 0.4)", // coral adventure glow

        // 🏖️ Travel Card Shadows - Soft, welcoming, layered
        card: "0 4px 16px -4px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(255, 107, 53, 0.04)",
        "card-hover":
          "0 12px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(255, 107, 53, 0.08)",
        "card-adventure":
          "0 8px 24px -4px rgba(255, 107, 53, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)",

        // 🌊 Special Adventure Shadows
        "adventure-float":
          "0 16px 48px rgba(42, 157, 143, 0.2), 0 8px 24px rgba(255, 107, 53, 0.1)",
        "travel-card":
          "0 6px 20px -6px rgba(255, 107, 53, 0.2), 0 4px 12px -4px rgba(0, 0, 0, 0.1)",
      },

      backdropBlur: {
        "2xl": "24px",
        "3xl": "40px",
      },
      // Enhanced keyframe animations for micro-interactions
      keyframes: {
        // Entrance animations
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },

        // Sophisticated hover and interaction animations
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 24px rgba(255, 107, 53, 0.3)" },
          "50%": { boxShadow: "0 0 36px rgba(255, 107, 53, 0.5)" },
        },
        "adventure-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(1deg)" },
          "66%": { transform: "translateY(-4px) rotate(-1deg)" },
        },
        "travel-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "card-hover": {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-4px) scale(1.02)" },
        },

        // Loading and progress animations
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },

      // Enhanced custom animations with better timing
      animation: {
        // Entrance animations
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-fast": "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up-fast": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",

        // Interaction animations
        "bounce-subtle": "bounce-subtle 0.6s ease-in-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "adventure-float": "adventure-float 4s ease-in-out infinite",
        "travel-bounce": "travel-bounce 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "card-hover": "card-hover 0.3s cubic-bezier(0.16, 1, 0.3, 1)",

        // Loading animations
        "spin-slow": "spin-slow 3s linear infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },

      // Custom transition timing functions
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        snappy: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // Enhanced transition durations
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        400: "400ms",
        600: "600ms",
        800: "800ms",
        1200: "1200ms",
      },
    },
  },

  // Variants configuration
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      backgroundColor: ["active"],
      textColor: ["active"],
      borderColor: ["active", "focus-within"],
      ringColor: ["focus-visible"],
      ringOffsetColor: ["focus-visible"],
      ringOffsetWidth: ["focus-visible"],
      ringWidth: ["focus-visible"],
    },
  },

  // Plugins
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),

    // Custom Adventure-themed utility classes
    function ({ addUtilities }) {
      const newUtilities = {
        // Adventure section containers
        ".adventure-section": {
          "@apply bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-8 lg:p-10 shadow-card transition-all duration-500 relative overflow-hidden":
            {},
        },
        ".adventure-section-hover": {
          "@apply hover:shadow-adventure-float": {},
        },
        ".adventure-section-primary": {
          "@apply hover:border-primary/50": {},
        },
        ".adventure-section-secondary": {
          "@apply hover:border-secondary/50": {},
        },
        ".adventure-section-accent": {
          "@apply hover:border-accent/50": {},
        },

        // Adventure glow effects
        ".adventure-glow-primary": {
          "@apply absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10":
            {},
        },
        ".adventure-glow-secondary": {
          "@apply absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10":
            {},
        },
        ".adventure-glow-accent": {
          "@apply absolute inset-0 bg-gradient-to-br from-accent/20 via-secondary/10 to-primary/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10":
            {},
        },

        // Adventure badges
        ".adventure-badge": {
          "@apply inline-flex items-center px-4 py-2 rounded-full font-bold text-lg mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300":
            {},
        },
        ".adventure-badge-primary": {
          "@apply bg-primary/20 text-primary": {},
        },
        ".adventure-badge-secondary": {
          "@apply bg-secondary/20 text-secondary": {},
        },
        ".adventure-badge-accent": {
          "@apply bg-accent/20 text-accent": {},
        },

        // Adventure content cards
        ".adventure-card": {
          "@apply bg-gradient-to-r from-background/60 to-background-card/50 backdrop-blur-sm border border-border/20 rounded-xl p-6":
            {},
        },
        ".adventure-card-enhanced": {
          "@apply bg-gradient-to-br from-background/60 to-background-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6":
            {},
        },

        // Adventure transforms
        ".adventure-rotate-left": {
          "@apply transform -rotate-1 hover:rotate-0 transition-transform duration-700":
            {},
        },
        ".adventure-rotate-right": {
          "@apply transform rotate-1 hover:rotate-0 transition-transform duration-700":
            {},
        },
        ".adventure-hover-lift": {
          "@apply transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300":
            {},
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
