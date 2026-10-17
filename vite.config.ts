import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// En desarrollo, /api se reenvía al backend (como hace el proxy de Netlify en
// producción): para el navegador el panel y la API son el mismo origen.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backend = env.BACKEND_URL || "http://localhost:8000"
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": { target: backend, changeOrigin: true, secure: true },
      },
    },
  }
})
