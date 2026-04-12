import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'icon-192-dark.png', 'icon-512-dark.png'],
      manifest: {
        name: 'MoviesearchDb',
        short_name: 'MovieDb',
        description: 'Semantic movie search and discovery',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192-dark.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512-dark.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-light.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),

  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      host: '0.0.0.0',
      clientPort: 5173,
    },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    https: false, 
    watch: {
      usePolling: true,
    },
    // proxy: {
    //   '/api': {
    //     target: 'https://backend-nest:3000',
    //     changeOrigin: true,
    //     secure: false, 
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //     configure: (proxy) => {
    //       proxy.on('error', (err) => console.error('[proxy error]', err))
    //     },
    //   },
    //   '/socket.io': {
    //     target: 'https://backend-nest:3000',
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true,
    //   },
    // },
  },
})
