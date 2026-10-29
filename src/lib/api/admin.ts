/** Operaciones del panel sobre el servicio, los teléfonos, sus logs, las rutas y la capacidad. */
import { request, requestJson } from "./client"
import {
  deviceLogsSchema,
  deviceSchema,
  deviceSessionsSchema,
  devicesSchema,
  fieldNotesSchema,
  geminiCheckSchema,
  metricsSchema,
  routeProfileSchema,
  routeProfilesSchema,
  settingsSchema,
  trackSchema,
  usageSchema,
  type Device,
  type DeviceLogs,
  type DeviceSession,
  type DeviceUpdate,
  type FieldNote,
  type NoteReview,
  type GeminiCheck,
  type Metrics,
  type RouteProfile,
  type Schedule,
  type ServiceSettings,
  type Track,
  type Usage,
  type UsageLimits,
} from "./schemas"

export function fetchSettings(): Promise<ServiceSettings> {
  return requestJson("/settings", settingsSchema)
}

export function updateSettings(body: {
  service_open?: boolean
  schedule?: Schedule
  usage_limits?: UsageLimits
}): Promise<ServiceSettings> {
  return requestJson("/settings", settingsSchema, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function fetchDevices(): Promise<Device[]> {
  return requestJson("/devices", devicesSchema)
}

export function updateDevice(id: number, body: DeviceUpdate): Promise<Device> {
  return requestJson(`/devices/${id}`, deviceSchema, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function closeDeviceSession(id: number): Promise<boolean> {
  const response = await request(`/devices/${id}/close-session`, {
    method: "POST",
  })
  const body = (await response.json()) as { closed?: boolean }
  return body.closed === true
}

export async function deleteDevice(id: number): Promise<void> {
  await request(`/devices/${id}`, { method: "DELETE" })
}

export function fetchDeviceSessions(id: number): Promise<DeviceSession[]> {
  return requestJson(`/devices/${id}/sessions`, deviceSessionsSchema)
}

export function fetchDeviceLogs(id: number): Promise<DeviceLogs> {
  return requestJson(`/devices/${id}/logs`, deviceLogsSchema)
}

/** Borra los logs que subió el teléfono; devuelve cuántos fragmentos eran. */
export async function clearDeviceLogs(id: number): Promise<number> {
  const response = await request(`/devices/${id}/logs`, { method: "DELETE" })
  const body = (await response.json()) as { deleted?: number }
  return body.deleted ?? 0
}

/** Descarga el .zip con los logs unidos del teléfono. */
export async function downloadDeviceLogs(id: number): Promise<void> {
  const response = await request(`/devices/${id}/logs.zip`)
  const disposition = response.headers.get("content-disposition") ?? ""
  const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "logs.zip"
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/** Notas de campo del teléfono, para curar rutas. */
export function fetchDeviceNotes(id: number): Promise<FieldNote[]> {
  return requestJson(`/devices/${id}/notes`, fieldNotesSchema)
}

/** Marca una nota como aplicada al perfil, descartada o de nuevo pendiente (HU-050). */
export async function reviewDeviceNote(
  id: number,
  note: FieldNote,
  status: NoteReview
): Promise<void> {
  await request(`/devices/${id}/notes/review`, {
    method: "PUT",
    body: JSON.stringify({ at: note.at, text: note.text, status }),
  })
}

/** Recorrido GPS de un día del teléfono (el más reciente sin `day`). */
export function fetchDeviceTrack(id: number, day?: string): Promise<Track> {
  const query = day ? `?day=${encodeURIComponent(day)}` : ""
  return requestJson(`/devices/${id}/track${query}`, trackSchema)
}

/** Perfiles de ruta curados (HU-022): viven en la base de datos del backend. */
export function fetchRoutes(): Promise<RouteProfile[]> {
  return requestJson("/routes", routeProfilesSchema)
}

/** Crea o reemplaza el perfil con su slug. */
export function saveRoute(profile: RouteProfile): Promise<RouteProfile> {
  return requestJson(`/routes/${profile.slug}`, routeProfileSchema, {
    method: "PUT",
    body: JSON.stringify(profile),
  })
}

export async function deleteRoute(slug: string): Promise<void> {
  await request(`/routes/${slug}`, { method: "DELETE" })
}

/** CPU, RAM, sesiones y tráfico del backend en las últimas `hours` horas. */
export function fetchMetrics(hours: number): Promise<Metrics> {
  return requestJson(`/metrics?hours=${hours}`, metricsSchema)
}

/** Consumo del mes frente a los límites y la última falla de Gemini (HU-051). */
export function fetchUsage(): Promise<Usage> {
  return requestJson("/usage", usageSchema)
}

/** Prueba ya la conexión con Gemini desde el backend, sin gastar minutos. */
export function checkGemini(): Promise<GeminiCheck> {
  return requestJson("/usage/check", geminiCheckSchema, { method: "POST" })
}
