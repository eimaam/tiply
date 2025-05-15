import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './globals.css'
import './styles/fonts.css'
import { ThemeProvider } from './components/ui/theme-provider'
import { UserProvider } from './contexts/UserContext'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css'

// Create wallet adapter with the popular wallet providers
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

// Use Solana devnet or mainnet
const endpoint = clusterApiUrl('devnet');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <App />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)