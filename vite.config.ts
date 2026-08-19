import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'sounds/*.mp3'],
      /* One workbox block only. These were previously declared twice, and the
         second literal silently won — dropping the 5MB cache ceiling back to
         workbox's 2MB default. Nothing exceeded it yet, but the world plates and
         lion pose art are exactly that size class and would have been dropped
         from the offline precache without any error. */
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
      },
      manifest: {
        name: 'Kids Learning Fun',
        short_name: 'KidLearn',
        description: 'A fun learning app for kids ages 2+',
        theme_color: '#FF6B6B',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
