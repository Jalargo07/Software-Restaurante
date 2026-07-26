import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import type { Plugin } from 'vite'

function deferCSS(): Plugin {
  return {
    name: 'defer-css',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(.*?)">/g,
        `<link rel="stylesheet" href="$1" media="print" onload="this.onload=null;this.media='all'"><noscript><link rel="stylesheet" href="$1"></noscript>`
      )
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    deferCSS(),
    ViteImageOptimizer({
      png: { quality: 80 },
      webp: { quality: 85 },
      avif: { quality: 70 },
    }),
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
