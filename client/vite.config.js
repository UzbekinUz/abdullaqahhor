import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const API = 'http://localhost:4000'
const proxy = { '/api': API, '/uploads': API }

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'Abdulla Qahhor',
        short_name: 'Qahhor',
        description: 'Abdulla Qahhor: hayoti, hikoyalari, iqtiboslari va audio',
        lang: 'uz',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0e2627',
        theme_color: '#0e2627',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Hikoyalar', url: '/hikoyalar', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Iqtiboslar', url: '/iqtiboslar', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['media/**'],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth'), handler: 'NetworkFirst', options: { cacheName: 'api', networkTimeoutSeconds: 4 } },
          { urlPattern: ({ url }) => url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/media/'), handler: 'CacheFirst', options: { cacheName: 'media', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 } } },
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'fonts' } },
        ],
      },
    }),
  ],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
})
