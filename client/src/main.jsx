import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AudioProvider } from './context/Audio.jsx'
import { InstallProvider } from './context/Install.jsx'
import { LensProvider } from './components/Lens.jsx'

document.documentElement.classList.add('js')
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AudioProvider>
        <InstallProvider>
          <LensProvider>
            <App />
          </LensProvider>
        </InstallProvider>
      </AudioProvider>
    </BrowserRouter>
  </StrictMode>,
)

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()))
  caches?.keys().then((ks) => ks.forEach((k) => caches.delete(k)))
}
