import * as React from 'react'

interface DevModeContextType {
  isDevMode: boolean
  setIsDevMode: (value: boolean) => void
}

const DevModeContext = React.createContext<DevModeContextType | undefined>(undefined)

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = React.useState(true) // Default to true until Circle account is activated

  const value = React.useMemo(
    () => ({
      isDevMode,
      setIsDevMode,
    }),
    [isDevMode]
  )

  return (
    <DevModeContext.Provider value={value}>
      {children}
    </DevModeContext.Provider>
  )
}

export function useDevMode() {
  const context = React.useContext(DevModeContext)
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider')
  }
  return context
} 