import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    // Honour a port assigned by the environment. Vite does not read PORT on its
    // own, so a dev-server harness that assigns one would otherwise be ignored:
    // Vite would fall back to 5173, find it busy, silently move to the next
    // free port, and the harness would open the wrong URL.
    port: Number(process.env.PORT) || 5173,
    // Only pin the port when one was explicitly assigned. A silent shift is
    // what breaks the caller; a plain `npm run dev` keeps Vite's forgiving
    // auto-increment. 5173 is also what the backend's CORS_ORIGIN defaults to.
    strictPort: Boolean(process.env.PORT),
  },
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
        // mp4 is deliberately absent below: the generated episodes in
        // public/videos are ~5 MB each, and precaching them would pull tens of
        // MB on first load. They belong in runtime caching, fetched once a
        // child actually plays one.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
