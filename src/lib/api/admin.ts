/** Operaciones del panel sobre el servicio, los teléfonos y sus logs. */
import { request, requestJson } from "./client"
import {
  deviceLogsSchema,
  deviceSchema,
  deviceSessionsSchema,
  devicesSchema,
  settingsSchema,
  type Device,
  type DeviceLogs,
  type DeviceSession,
  type DeviceUpdate,
  type Schedule,
  type ServiceSettings,
} from "./schemas"

export function fetchSettings(): Promise<ServiceSettings> {
  return requestJson("/settings", settingsSchema)
}

export function updateSettings(body: {
  service_open?: boolean
  schedule?: Schedule
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
