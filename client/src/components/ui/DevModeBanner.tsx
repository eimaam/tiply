import * as React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangleIcon } from 'lucide-react'
import { useDevMode } from '@/contexts/DevModeContext'

export const DevModeBanner = () => {
  const [isVisible, setIsVisible] = React.useState(true)
  const { isDevMode } = useDevMode()
  const isDev = process.env.NODE_ENV === 'development'

  if (!isVisible || (!isDevMode && !isDev)) return null

  const message = isDev 
    ? 'Running in development mode. Some features may be limited.' 
    : 'Platform is in development mode. Circle account activation pending.'

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-brand-primary/10 border-b border-brand-primary/20"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-brand-primary">
            <AlertTriangleIcon className="h-4 w-4" />
            <span>{message}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  )
} 