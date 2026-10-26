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
  /** Mediana de la latencia voz a voz (ms): el "ping" del teléfono. */
  latency_median_ms: z.number().nullable().optional().default(null),
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

/**
 * Perfil de ruta curado (HU-022), el mismo contrato que `RouteProfile` del
 * backend: se valida aquí antes de enviarlo para dar el error exacto.
 */
export const routePointSchema = z
  .object({
    name: z.string().min(1).max(80),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    instruction: z.string().max(200).default(""),
    risk: z.enum(["low", "medium", "high"]).default("low"),
    crossing: z
      .enum(["traffic_light", "zebra", "uncontrolled"])
      .nullable()
      .default(null),
    approach_m: z.number().positive().max(300).default(60),
    arrive_m: z.number().positive().max(100).default(15),
  })
  .refine((p) => p.arrive_m < p.approach_m, {
    message: "arrive_m debe ser menor que approach_m",
    path: ["arrive_m"],
  })

export const routeProfileSchema = z.object({
  slug: z
    .string()
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "solo minúsculas, números y guiones"),
  name: z.string().min(1).max(120),
  origin: z.string().min(1).max(80),
  destination: z.string().min(1).max(80),
  direction: z.enum(["outbound", "return"]),
  family: z.enum(["A", "B", "other"]).default("other"),
  validated_in_field: z.boolean().default(false),
  points: z.array(routePointSchema).min(2).max(60),
})
export type RouteProfile = z.infer<typeof routeProfileSchema>
export const routeProfilesSchema = z.array(routeProfileSchema)

const platformSummarySchema = z.object({
  samples: z.number().int(),
  cpu_avg: z.number().optional(),
  cpu_max: z.number().optional(),
  rss_max_mb: z.number().optional(),
  sessions_max: z.number().int().optional(),
  loop_lag_max_ms: z.number().optional(),
  /** Estimaciones: solo existen si hubo sesiones (y, la RAM, también reposo). */
  cpu_per_session: z.number().optional(),
  mb_per_session: z.number().optional(),
  kbps_per_session: z.number().optional(),
})
export type PlatformSummary = z.infer<typeof platformSummarySchema>

const metricPointSchema = z.object({
  ts: z.string(),
  platform: z.string(),
  cpu_pct: z.number(),
  rss_mb: z.number(),
  active_sessions: z.number().int(),
  kbps_up: z.number(),
  kbps_down: z.number(),
  loop_lag_ms: z.number(),
})
export type MetricPoint = z.infer<typeof metricPointSchema>

/** Capacidad del servidor (CPU, RAM, sesiones, tráfico), por plataforma. */
export const metricsSchema = z.object({
  hours: z.number().int(),
  live_sessions: z.number().int(),
  summary: z.record(z.string(), platformSummarySchema),
  series: z.array(metricPointSchema),
})
export type Metrics = z.infer<typeof metricsSchema>
