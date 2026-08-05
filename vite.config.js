import { defineConfig } from 'vite';
//import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // TinyMCEEditor and CarerLetterScreen exceed the default 500kB warning
    // limit, but both are lazy-loaded (see App.jsx/CarerLetterScreen.jsx) and
    // never part of the initial bundle, so the warning is a false positive.
    chunkSizeWarningLimit: 1500,
  },
  plugins: [
    //  visualizer({
    //   open: true,
    //   gzipSize: true,
    // }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Bonda',
        short_name: 'Bonda',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png' 
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
  
  //plugins: [react()]
});
