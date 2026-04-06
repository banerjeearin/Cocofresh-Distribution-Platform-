import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],

      // Web App Manifest
      manifest: {
        name: 'CocoFresh Distribution',
        short_name: 'CocoFresh',
        description: 'Manage coconut deliveries, subscriptions, payments and WhatsApp messaging',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['business', 'productivity'],
        shortcuts: [
          {
            name: 'Deliveries',
            short_name: 'Deliveries',
            description: "Today's delivery routes",
            url: '/deliveries',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Customers',
            short_name: 'Customers',
            description: 'Customer registry',
            url: '/customers',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Payments',
            short_name: 'Payments',
            description: 'Record payments',
            url: '/payments',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },

      // Workbox — cache strategy
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache API calls from backend — network-first so data is always fresh
            urlPattern: /^http:\/\/localhost:3001\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cocofresh-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // Dev options — enable SW in dev for testing
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
