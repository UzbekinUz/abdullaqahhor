import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const API = 'http://localhost:4000'
const proxy = { '/api': API, '/uploads': API }

// Admin ilovasi: ochiq saytdan butunlay alohida (o'z manzili, o'z PWA'si)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'Qahhor Admin',
        short_name: 'Admin',
        description: 'Abdulla Qahhor saytini boshqarish paneli',
        lang: 'uz',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0e2627',
        theme_color: '#1d3d3e',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Admin ma'lumotlari keshlanmaydi: doim yangi holat
        runtimeCaching: [{ urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'fonts' } }],
      },
    }),
  ],
  server: { port: 5174, proxy },
  preview: { port: 4174, proxy },
})
