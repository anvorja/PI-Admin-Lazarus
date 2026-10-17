# Lazarus · Consola del piloto

Panel de administración del piloto de Lazarus: abre y cierra el servicio de las
jornadas de campo, aprueba los teléfonos de los participantes, les pone un límite
de minutos, corta sesiones y descarga sus logs de campo. Habla con la API
`/api/v1/admin/*` del backend (PI-Backend-Lazarus).

## Stack

React 19, TypeScript estricto, Vite, Tailwind CSS 4, shadcn/ui (Radix), TanStack
Query (datos del servidor) y TanStack Router (rutas con búsqueda tipada), zod
(contratos de la API), motion y sonner. Fuente Geist.

## Arquitectura

Context + Provider + Hook (manual de hooks del equipo):

```
src/
├── contexts/      Solo createContext y su contrato (AuthContext, ThemeContext)
├── providers/     Estado y efectos (AuthProvider, ThemeProvider, QueryProvider)
├── hooks/         Interfaz para los componentes (useAuth, useTheme, useDevices…)
├── lib/api/       Cliente HTTP, contratos zod y operaciones del panel
├── components/    console/, devices/, auth/, brand/ y ui/ (shadcn)
└── router.tsx     /ingresar y / (con ?dispositivo=ID para el detalle)
```

- **Sesión:** token de acceso de 15 minutos solo en memoria; al recargar se
  renueva con la cookie HttpOnly del refresh. Si varias peticiones reciben 401 a
  la vez, comparten una sola renovación (el refresh es rotativo).
- **Proxy:** el panel llama a rutas relativas `/api/...`. En desarrollo las
  reenvía Vite y en Netlify una regla de proxy, así que para el navegador panel y
  API son el mismo origen: la cookie viaja con `SameSite=Strict` y no hace falta
  CORS.

## Desarrollo

```bash
cp .env.example .env      # BACKEND_URL=http://localhost:8000 (o la de Render)
pnpm install
pnpm dev
```

`pnpm build` compila; `pnpm lint` y `pnpm format` revisan el código.

## Despliegue en Netlify

1. Conectar este repositorio en Netlify (rama `main`).
2. En Site configuration → Environment variables, definir `BACKEND_URL` con la URL
   https del backend en Render.
3. El build (`netlify.toml`) compila y escribe `dist/_redirects` con el proxy de
   `/api/*` hacia `BACKEND_URL`. La URL del backend no vive en el repositorio.

El administrador se crea en el backend (variables `ADMIN_USERNAME`,
`ADMIN_PASSWORD` y `ADMIN_JWT_SECRET` de Render).
