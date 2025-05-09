import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: { max: '820px' },
        md: { min: '1000px' },
        lg: { min: '1310px' },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        // Dark mode colors (default)
        background: '#0c0a09', 
        foreground: '#ffffff',
        
        // Brand namespace for components
        brand: {
          // Dark mode colors
          background: '#0c0a09',
          foreground: '#ffffff',
          primary: '#a78bfa',
          'primary-foreground': '#fafafa',
          secondary: '#27272a',
          'secondary-foreground': '#ffffff',
          accent: '#a78bfa',
          'accent-foreground': '#ffffff',
          muted: '#27272a',
          'muted-foreground': '#a1a1aa',
          border: '#27272a',
          surface: '#121214',
          
          // Light mode colors - will be applied via CSS
          light: {
            background: '#ffffff',
            foreground: '#5F6C72',
            primary: '#a78bfa',
            'primary-foreground': '#ffffff',
            secondary: '#f5f5f7',
            'secondary-foreground': '#111827',
            accent: '#a78bfa',
            'accent-foreground': '#ffffff',
            muted: '#f5f5f7',
            'muted-foreground': '#6b7280',
            border: '#e5e7eb',
            surface: '#ffffff',
          }
        },
        
        // Direct color access without "brand" namespace
        primary: {
          DEFAULT: '#a78bfa',
          foreground: '#ffffff',
          light: '#a78bfa',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#ffffff',
          light: '#f5f5f7',
        },
        accent: {
          DEFAULT: '#a78bfa',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
          light: '#f5f5f7',
        },
        border: {
          DEFAULT: '#27272a',
          light: '#e5e7eb',
        },
        surface: {
          DEFAULT: '#121214',
          light: '#ffffff',
        },
        'brand-background': '#f8f8f8',
        'brand-foreground': '#242424',
        'brand-surface': '#ffffff',
        'brand-secondary': '#f0f0f0',
        'brand-border': '#e0e0e0',
        'muted-foreground': '#636363',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(to right bottom, rgba(124, 58, 237, 0.05), rgba(14, 165, 233, 0.05))',
        'gradient-mesh-dark': 'linear-gradient(to right bottom, rgba(124, 58, 237, 0.1), rgba(14, 165, 233, 0.1))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(167, 139, 250, 0.1)',
        'glow-md': '0 0 0 1px rgba(124, 58, 237, 0.05), 0 4px 6px -1px rgba(124, 58, 237, 0.1), 0 2px 4px -2px rgba(124, 58, 237, 0.1)',
        'glow-lg': '0 0 0 1px rgba(124, 58, 237, 0.05), 0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -4px rgba(124, 58, 237, 0.1)',
        'glass': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px -1px rgba(255, 255, 255, 0.1)',
        'glass-md': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -2px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -4px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config