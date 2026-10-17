// Escribe dist/_redirects para Netlify: /api/* se reenvía al backend (proxy,
// código 200) y el resto de rutas cae en index.html (SPA). La URL del backend
// llega por la variable BACKEND_URL de Netlify, no vive en el repositorio.
import { writeFileSync } from "node:fs"

/**
 * Acepta la URL tal como suele pegarse en el panel de Netlify: con espacios o
 * comillas, con "BACKEND_URL=" delante, sin "https://" o con "/" al final.
 */
function normalize(raw) {
  let value = (raw ?? "").trim().replace(/^BACKEND_URL\s*=\s*/i, "")
  value = value.replace(/^["']|["']$/g, "").trim()
  if (value && !/^[a-z]+:\/\//i.test(value)) value = `https://${value}`
  return value.replace(/\/+$/, "").replace(/\/api(\/v1)?$/i, "")
}

const raw = process.env.BACKEND_URL
const backend = normalize(raw)
let host = ""
try {
  const url = new URL(backend)
  if (url.protocol !== "https:") throw new Error("no es https")
  host = url.host
} catch {
  console.error(
    `BACKEND_URL no es una URL https válida (se recibió: ${JSON.stringify(raw ?? "")}). ` +
      'En Netlify: Site configuration → Environment variables, valor "https://tu-backend.onrender.com".'
  )
  process.exit(1)
}

writeFileSync(
  "dist/_redirects",
  [`/api/*  ${backend}/api/:splat  200!`, "/*  /index.html  200", ""].join("\n")
)
console.log(`dist/_redirects listo: /api/* reenviado a ${host}`)
