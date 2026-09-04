import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  /* KEEP THE WATCHER OUT OF NESTED CHECKOUTS.
     Subagent worktrees live at `.claude/worktrees/<id>/`, each a full checkout
     of this repo, and `art/blender/` holds the .blend outputs the build scripts
     rewrite. Both are inside the project root, so vite watched them by default:
     an agent editing a file in its own worktree hot-reloaded THIS dev server,
     and a Blender rebuild fired a reload per .blend write.
     The symptom was not a slow reload, it was a REMOUNT — which resets the
     mascot to its spawn and the page's wander flag to its default. A lion
     halfway across the bridge would snap home, and the obvious reading was a
     bug in the crossing rather than a file watcher three directories away. */
  server: {
    watch: {
      ignored: [
        '**/.claude/worktrees/**',
        '**/art/blender/**',
        '**/docs/assets/**',
      ],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'sounds/*.mp3'],
      /* One workbox block only. These were previously declared twice, and the
         second literal silently won — dropping the enlarged cache ceiling back to
         workbox's 2MB default. Nothing exceeded it yet, but the world plates and
         production lion GLB are exactly that size class and would have been dropped
         from the offline precache without any error. */
      workbox: {
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,glb,mp3,wav}'],
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
