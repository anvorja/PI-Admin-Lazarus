/**
 * Token de acceso del administrador. Vive solo en memoria (nunca en
 * localStorage): al recargar la página se pide uno nuevo con la cookie
 * HttpOnly del refresh.
 */
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}
