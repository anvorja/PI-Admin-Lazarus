/** Fechas, duraciones y textos de estado, en español y hora de Colombia. */
import type { DeviceStatus } from "@/lib/api/schemas"

const TIME_ZONE = "America/Bogota"

/** La API entrega UTC sin zona ("2026-10-17T19:01:45"). */
export function parseUtc(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`)
}

const dateTime = new Intl.DateTimeFormat("es-CO", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
})

export function formatDateTime(value: string | null): string {
  return value ? dateTime.format(parseUtc(value)) : "Nunca"
}

const relative = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" })

export function formatRelative(value: string | null, now = Date.now()): string {
  if (!value) return "Nunca"
  const seconds = Math.round((parseUtc(value).getTime() - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return "ahora"
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute")
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour")
  return relative.format(Math.round(seconds / 86400), "day")
}

export function formatMinutes(minutes: number): string {
  if (minutes < 1) return "0 min"
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m ? `${h} h ${m} min` : `${h} h`
}

/** "2,6 s": latencia en segundos con coma decimal. */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const STATUS_LABEL: Record<DeviceStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  disabled: "Deshabilitado",
}

/** Códigos de cierre de una sesión, como los entrega el proxy. */
export function closeReason(code: number | null, ended: boolean): string {
  if (!ended) return "En curso"
  switch (code) {
    case null:
      return "Terminó normal"
    case 4001:
      return "Gemini cerró"
    case 4002:
      return "Error de red"
    case 4003:
      return "Sin cuota"
    case 4005:
      return "Sin saldo"
    case 4006:
      return "En pausa"
    case 4009:
      return "Minutos del día"
    case 4010:
      return "Cerrada desde el panel"
    default:
      return `Código ${code}`
  }
}

const TRANSPORT_LABEL: Record<string, string> = {
  wifi: "Wi-Fi",
  cellular: "Datos",
  other: "Otra red",
  none: "Sin red",
}

/** "Claro · Datos", "Wi-Fi", o "" si la app no informó la red. */
export function networkLabel(carrier: string, transport: string): string {
  const kind = TRANSPORT_LABEL[transport] ?? ""
  // El operador solo importa con datos móviles: en Wi-Fi no es la red en uso.
  if (transport === "wifi") return kind
  return [carrier, kind].filter(Boolean).join(" · ")
}

/** Nombre visible: el seudónimo, o el modelo mientras no tenga uno. */
export function deviceLabel(device: { name: string; model: string }): string {
  return device.name.trim() || device.model || "Teléfono sin nombre"
}
