import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-biteops.png', 'logo-biteops.webp', 'banner-biteops.webp'],
      manifest: {
        name: 'BiteOps — Sistema de gestión para restaurantes',
        short_name: 'BiteOps',
        description: 'Gestiona mesas, comandas, inventario y reportes desde una sola plataforma',
        theme_color: '#059669',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo-biteops.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-biteops.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-biteops.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
