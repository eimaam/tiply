import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'
import { ThemeProvider } from './components/ui/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)