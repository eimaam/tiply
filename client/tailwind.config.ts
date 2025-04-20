import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        spaceGrotesk: ['"Space Grotesk"', 'sans-serif'],
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
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [],
}

export default config