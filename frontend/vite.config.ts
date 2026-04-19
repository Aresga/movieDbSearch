import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ── Production build settings ──────────────────────────────────────────
    build: {
      outDir: 'dist',
      sourcemap: false,           // no source maps exposed in prod
      minify: 'esbuild' as const,
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
    },

    // ── Dev server (ignored during `npm run build`) ────────────────────────
    server: {
      hmr: {
        host: 'localhost',
        protocol: 'wss',
        clientPort: 443,
      },
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true,
      },
    },
  }
})