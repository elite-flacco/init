/** @type {import('tailwindcss').Config} */
module.exports = {
  
  // Define where Tailwind should look for class names in your files
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // Theme configuration
  theme: {
    extend: {
      // Enhanced color palette with more sophisticated variants
      colors: {
        // 🌅 Coral Coast (Primary) - Warm & playful with tropical edge
        primary: {
          DEFAULT: '#f75c4c',  // Coral red (fun, energetic)
          light: '#ff8c7a',    // Soft coral
          dark: '#e05244',     // Deeper terracotta
        },
      
        // 🌊 Teal Waters (Accent) - Balancing cool tone
        accent: {
          DEFAULT: '#06b6d4',  // Cyan-teal
          light: '#22d3ee',    // Lighter water tone
          dark: '#0e7490',     // Deep teal
        },
      
        // 🍋 Golden Drift (Secondary) - Pop of sunshine
        secondary: {
          DEFAULT: '#ffd166',  // Golden yellow
          light: '#ffe49e',    // Pale lemon
          dark: '#e6b84f',     // Honey gold
        },
      
        // ✅ Semantic Colors (slightly softened for friendliness)
        success: {
          DEFAULT: '#10b981',  // Emerald green
        },
        warning: {
          DEFAULT: '#facc15',  // Warm yellow
        },
        error: {
          DEFAULT: '#ef4444',  // Friendly red
        },
        info: {
          DEFAULT: '#3b82f6',  // Sky blue
        },
      
        // 🪨 Backgrounds - Light, soft, with warmth
        background: {
          DEFAULT: '#fdf6f6',      // Light blush tone
          muted: '#fefae0',        // Soft cream
          soft: '#fafafa',         // General UI background
          card: '#ffffff',         // Card backgrounds
        },
      
        // 🖋 Foregrounds - Gentle contrast, travel-friendly
        foreground: {
          DEFAULT: '#2f3e46',      // Deep sea gray
          secondary: '#475569',    // Slate-600
          muted: '#64748b',        // Slate-500
          dim: '#94a3b8',          // Slate-400
          ghost: '#cbd5e1',        // Slate-300
        },
      
        // 📏 Borders & Rings
        border: {
          DEFAULT: '#e2e8f0',      // Neutral border
          secondary: '#cbd5e1',    // Soft border
          muted: '#f1f5f9',        // Light background border
        },
        ring: {
          DEFAULT: '#f75c4c',      // Coral focus
          primary: '#ffd166',      // Yellow focus
          muted: '#cbd5e1',        // Subtle focus
        },
      },
      
      
      // Enhanced Typography with better scales and spacing
      fontFamily: {
        // System font stack with fallbacks
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Display font for headings
        display: [
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        // Monospace font stack
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      
      // Enhanced font sizes with better mobile scaling
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      lineHeight: {
        'extra-tight': '1.1',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '5rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        // ✨ Glow effects for buttons or special components
        glow: '0 0 12px rgba(255, 111, 97, 0.3)',           // coral glow (primary)
        'glow-lg': '0 0 32px rgba(255, 111, 97, 0.4)',
        'glow-yellow': '0 0 20px rgba(255, 209, 102, 0.4)', // golden glow (secondary)
      
        // 🧱 Card shadows – soft, layered for modern feel
        card: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      
        // 🌈 Optional: Special floating or modal shadow
        highlight: '0 12px 40px rgba(6, 182, 212, 0.25)',    // teal glow (accent)
      },
      
      backdropBlur: {
        '2xl': '24px',
        '3xl': '40px',
      },
      // Enhanced keyframe animations for micro-interactions
      keyframes: {
        // Entrance animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        
        // Sophisticated hover and interaction animations
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'card-hover': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-4px) scale(1.02)' },
        },
        
        // Loading and progress animations
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      
      // Enhanced custom animations with better timing
      animation: {
        // Entrance animations
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-fast': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-fast': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        
        // Interaction animations
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'card-hover': 'card-hover 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        
        // Loading animations
        'spin-slow': 'spin-slow 3s linear infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      
      // Custom transition timing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Enhanced transition durations
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  
  // Variants configuration
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active'],
      textColor: ['active'],
      borderColor: ['active', 'focus-within'],
      ringColor: ['focus-visible'],
      ringOffsetColor: ['focus-visible'],
      ringOffsetWidth: ['focus-visible'],
      ringWidth: ['focus-visible'],
    },
  },
  
  // Plugins
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
