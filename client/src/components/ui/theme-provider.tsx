import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { ConfigProvider, theme as antTheme } from 'antd'

type ThemeProviderProps = {
  children: ReactNode
}

type ThemeProviderState = {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark') // Default to dark

  // Apply theme class to document
  const applyThemeClass = (newTheme: 'dark' | 'light') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    // Check for system preference or stored preference
    const storedTheme = localStorage.getItem('theme')
    
    if (storedTheme === 'light') {
      setTheme('light')
      applyThemeClass('light')
    } else if (!storedTheme && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
      applyThemeClass('light')
    } else {
      // Explicitly set dark mode as default
      applyThemeClass('dark')
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark'
      
      // Apply theme class
      applyThemeClass(newTheme)
      
      // Save preference
      localStorage.setItem('theme', newTheme)
      return newTheme
    })
  }

  // Ant Design theme configuration
  const antDesignTheme = {
    algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      // Core token colors - using Tailwind custom palette
      colorPrimary: '#a78bfa', // brand.primary from palette
      colorInfo: '#a78bfa',
      colorSuccess: '#10b981', // Adding a standard success color
      colorWarning: '#f59e0b', // Adding a standard warning color
      colorError: '#ef4444', // Adding a standard error color
      colorTextBase: theme === 'dark' ? '#ffffff' : '#5F6C72', // brand.foreground
      colorBgBase: theme === 'dark' ? '#0c0a09' : '#ffffff', // brand.background
      
      // Border colors
      colorBorder: theme === 'dark' ? '#27272a' : '#e5e7eb', // brand.border
      
      // Component background colors
      colorBgContainer: theme === 'dark' ? '#121214' : '#ffffff', // brand.surface
      colorBgElevated: theme === 'dark' ? '#27272a' : '#ffffff', // for popups, dropdowns, etc.
      
      // Text colors
      colorTextSecondary: theme === 'dark' ? '#a1a1aa' : '#6b7280', // brand.muted-foreground
      
      // Border radius
      borderRadius: 8, 
      
      // Font family
      fontFamily: '"Space Grotesk", system-ui, sans-serif', 
    },
    components: {
      Input: {
        colorBgContainer: theme === 'dark' ? '#121214' : '#ffffff',
        colorText: theme === 'dark' ? '#ffffff' : '#5F6C72',
        colorIcon: theme === 'dark' ? '#a1a1aa' : '#6b7280', 
        colorIconHover: theme === 'dark' ? '#ffffff' : '#5F6C72',
      },
      Button: {
        colorPrimary: '#a78bfa',
        colorPrimaryHover: '#b79dfa',
        colorPrimaryActive: '#9779fa',
      },
    },
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, toggleTheme }}>
      <ConfigProvider theme={antDesignTheme}>
        {children}
      </ConfigProvider>
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}