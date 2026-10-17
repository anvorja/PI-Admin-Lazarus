// Escribe dist/_redirects para Netlify: /api/* se reenvía al backend (proxy,
// código 200) y el resto de rutas cae en index.html (SPA). La URL del backend
// llega por la variable BACKEND_URL de Netlify, no vive en el repositorio.
import { writeFileSync } from "node:fs"

const backend = (process.env.BACKEND_URL ?? "").replace(/\/+$/, "")
if (!/^https:\/\//.test(backend)) {
  console.error(
    "BACKEND_URL debe ser la URL https del backend (variable de entorno de Netlify)."
  )
  process.exit(1)
}

writeFileSync(
  "dist/_redirects",
  [`/api/*  ${backend}/api/:splat  200!`, "/*  /index.html  200", ""].join("\n")
)
console.log("dist/_redirects listo: /api/* reenviado al backend")
