/**
 * Contratos de la API del panel (`/api/v1/admin/*`), validados con zod: si el
 * backend cambia la forma de una respuesta, el panel lo dice en vez de pintar
 * datos rotos.
 */
import { z } from "zod"

export const tokenSchema = z.object({
  access_token: z.string().min(1),
  username: z.string(),
})
export type TokenResponse = z.infer<typeof tokenSchema>

export const scheduleSchema = z.object({
  enabled: z.boolean(),
  days: z.array(z.number().int().min(0).max(6)),
  from: z.string().regex(/^\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}$/),
})
export type Schedule = z.infer<typeof scheduleSchema>

export const settingsSchema = z.object({
  service_open: z.boolean(),
  schedule: scheduleSchema,
  open_now: z.boolean(),
})
export type ServiceSettings = z.infer<typeof settingsSchema>

export const deviceStatusSchema = z.enum(["pending", "approved", "disabled"])
export type DeviceStatus = z.infer<typeof deviceStatusSchema>

export const deviceSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: deviceStatusSchema,
  model: z.string(),
  android: z.string(),
  app_version: z.string(),
  last_ip: z.string(),
  created_at: z.string(),
  last_seen_at: z.string().nullable(),
  daily_minutes_limit: z.number().int().nullable(),
  upload_requested: z.boolean(),
  minutes_today: z.number(),
  active: z.boolean(),
  uploads: z.number().int(),
  last_upload_at: z.string().nullable(),
})
export type Device = z.infer<typeof deviceSchema>
export const devicesSchema = z.array(deviceSchema)

export const deviceSessionSchema = z.object({
  id: z.number().int(),
  started_at: z.string(),
  ended_at: z.string().nullable(),
  duration_s: z.number(),
  close_code: z.number().int().nullable(),
  ip: z.string(),
})
export type DeviceSession = z.infer<typeof deviceSessionSchema>
export const deviceSessionsSchema = z.array(deviceSessionSchema)

export const deviceLogsSchema = z.object({
  files: z.array(z.object({ name: z.string(), size: z.number().int() })),
  latency: z.object({
    count: z.number().int(),
    median_ms: z.number().nullable(),
    p90_ms: z.number().nullable(),
  }),
})
export type DeviceLogs = z.infer<typeof deviceLogsSchema>

export interface DeviceUpdate {
  name?: string
  status?: DeviceStatus
  /** 0 o negativo = sin límite. */
  daily_minutes_limit?: number
  upload_requested?: boolean
}
