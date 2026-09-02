import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'JeCoursPourMaForme',
        short_name: 'CourirPourMaForme',
        description: 'Application de course guidée pour se mettre à la course à pied.',
        display: 'standalone',
        theme_color: '#85BC24',
        background_color: '#022C4D',
        icons: [
          {
            src: '/icons/logo-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/logo-512-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
