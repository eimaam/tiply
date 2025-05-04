import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { UserProvider } from './contexts/UserContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ThemeProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </ThemeProvider>
  </React.StrictMode>
)