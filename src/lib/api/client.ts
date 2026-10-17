/**
 * Cliente HTTP del panel. Las rutas son relativas (`/api/v1/...`): en
 * desarrollo las reenvía Vite y en Netlify el proxy, así que para el navegador
 * panel y API son el mismo origen y la cookie del refresh viaja sola.
 */
import type { z } from "zod"

import { getAccessToken, setAccessToken } from "./session"
import { tokenSchema, type TokenResponse } from "./schemas"

const API = "/api/v1/admin"

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** Se avisa al proveedor de sesión cuando el refresh ya no sirve. */
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler
}

// Una sola renovación a la vez: si varias peticiones reciben 401 juntas, todas
// esperan la misma. Con refresh rotativo, dos renovaciones paralelas harían
// que la segunda use un token ya revocado.
let refreshing: Promise<TokenResponse | null> | null = null

export function refreshSession(): Promise<TokenResponse | null> {
  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API}/refresh`, {
        method: "POST",
        credentials: "same-origin",
      })
      if (!response.ok) return null
      const token = tokenSchema.parse(await response.json())
      setAccessToken(token.access_token)
      return token
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail: unknown }).detail
      if (typeof detail === "string") return detail
    }
  } catch {
    // Sin cuerpo JSON.
  }
  return `Error ${response.status}`
}

async function send(path: string, init: RequestInit): Promise<Response> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  return fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  })
}

/** Petición autenticada; ante un 401 renueva la sesión una vez y reintenta. */
export async function request(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  let response = await send(path, init)
  if (response.status === 401) {
    const renewed = await refreshSession()
    if (renewed) response = await send(path, init)
  }
  if (response.status === 401) {
    setAccessToken(null)
    onSessionExpired?.()
    throw new ApiError(401, "La sesión venció. Vuelve a entrar.")
  }
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response))
  }
  return response
}

export async function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {}
): Promise<T> {
  const response = await request(path, init)
  return schema.parse(await response.json())
}

export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 503
        ? "El panel no está configurado en el servidor."
        : response.status === 401
          ? "Usuario o contraseña incorrectos."
          : await errorMessage(response)
    )
  }
  const token = tokenSchema.parse(await response.json())
  setAccessToken(token.access_token)
  return token
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API}/logout`, { method: "POST", credentials: "same-origin" })
  } finally {
    setAccessToken(null)
  }
}
