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
        // Main colors from your current HSL values
        background: '#0c0a09', 
        foreground: '#fafafa',
        
        // Brand namespace for backward compatibility
        brand: {
          background: '#0c0a09',
          foreground: '#fafafa',
          primary: '#a78bfa',
          'primary-foreground': '#fafafa',
          secondary: '#27272a',
          'secondary-foreground': '#fafafa',
          accent: '#a78bfa',
          'accent-foreground': '#fafafa',
          muted: '#27272a',
          'muted-foreground': '#a1a1aa',
          border: '#27272a',
          surface: '#0c0a09',
        },
        
        // Direct color access without "brand" namespace
        primary: {
          DEFAULT: '#a78bfa',
          foreground: '#fafafa',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        accent: {
          DEFAULT: '#a78bfa',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#27272a',
          foreground: '#a1a1aa',
        },
        border: '#27272a',
        surface: '#0c0a09',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config