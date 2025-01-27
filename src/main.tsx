import './index.css'

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { SpotifyProvider } from './contexts/SpotifyContext.tsx'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SpotifyProvider>
      <App />
    </SpotifyProvider>
  </BrowserRouter>
)
