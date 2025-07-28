/** @type {import('tailwindcss').Config} */
module.exports = {
  
  // Define where Tailwind should look for class names in your files
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  // Theme configuration
  theme: {
    extend: {
      // Color palette - semantic naming for better maintainability
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#0e7c86', // teal-600
          light: '#14b8a6',   // teal-500
          dark: '#0d9488',    // teal-600
        },
        
        // Secondary brand colors
        secondary: {
          DEFAULT: '#f59e0b', // amber-500
          light: '#fbbf24',   // amber-400
          dark: '#d97706',    // amber-600
        },
        
        // Accent color (for variety in gradients and highlights)
        accent: '#6d28d9', // violet-500

        // Semantic colors
        success: '#10b981',
        warning: '#facc15',
        error: '#ef4444',
        info: '#3b82f6',

        // Theme semantic colors for consistent foreground/background
        background: {
          DEFAULT: '#f9fafb',      // gray-50
          muted: '#f3f4f6',         // gray-100
        },
        foreground: {
          DEFAULT: '#111827',      // gray-900
          secondary: '#4a5568',    // gray-700
          dim: '#9ca3af',        // gray-400
        },
        border: {
          DEFAULT: '#e5e7eb',      // gray-200
          secondary: '#d1d5db',    // gray-300
        },
        ring: '#3B82F6',
      },
      
      // Typography
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
      
      // Container configuration
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      
      // Extend default spacing
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      
      // Border radius
      borderRadius: {
        '4xl': '2rem',
      },
      
      // Custom keyframe animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
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
