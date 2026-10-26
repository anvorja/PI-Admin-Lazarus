import { Gauge } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMetrics } from "@/hooks/useMetrics"
import type { MetricPoint, Metrics, PlatformSummary } from "@/lib/api/schemas"
import { parseUtc } from "@/lib/format"
import { cn } from "@/lib/utils"

const RANGES = [
  { hours: 1, label: "1 h" },
  { hours: 6, label: "6 h" },
  { hours: 24, label: "24 h" },
  { hours: 168, label: "7 d" },
] as const

/** Cada plataforma lleva color y trazo propios: el color no es lo único que las distingue. */
const PLATFORM_STYLE: Record<
  string,
  { label: string; text: string; dash?: string }
> = {
  render: { label: "Render", text: "text-signal" },
  aws: { label: "AWS", text: "text-wait", dash: "6 4" },
  local: { label: "Local", text: "text-muted-foreground", dash: "2 3" },
}

function styleOf(platform: string) {
  return (
    PLATFORM_STYLE[platform] ?? {
      label: platform,
      text: "text-muted-foreground",
    }
  )
}

const num = (value: number | undefined, digits = 1) =>
  value === undefined
    ? "—"
    : value.toLocaleString("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
      })

/** Un hueco mayor a esto (Render se duerme sin tráfico) corta la línea. */
const GAP_MS = 2 * 60_000

interface ChartProps {
  title: string
  unit: string
  series: Record<string, MetricPoint[]>
  value: (point: MetricPoint) => number
  from: number
  to: number
}

function LineChart({ title, unit, series, value, from, to }: ChartProps) {
  const W = 300
  const H = 72
  const entries = Object.entries(series)
  const max = Math.max(1, ...entries.flatMap(([, points]) => points.map(value)))
  const x = (ts: number) => ((ts - from) / Math.max(1, to - from)) * W
  const y = (v: number) => H - (v / max) * (H - 6) - 3

  return (
    <figure className="min-w-0">
      <figcaption className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium">{title}</span>
        <span className="font-mono text-muted-foreground tabular-nums">
          máx. {num(max)} {unit}
        </span>
      </figcaption>
      <svg
        role="img"
        aria-label={`${title}: ${entries
          .map(([platform, points]) => {
            const top = Math.max(0, ...points.map(value))
            return `${styleOf(platform).label} hasta ${num(top)} ${unit}`
          })
          .join(", ")}`}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-2 h-[72px] w-full overflow-visible rounded-md bg-muted/40"
      >
        {entries.map(([platform, points]) => {
          const { text, dash } = styleOf(platform)
          const segments: MetricPoint[][] = []
          for (const point of points) {
            const last = segments.at(-1)
            const prev = last?.at(-1)
            if (
              last &&
              prev &&
              parseUtc(point.ts).getTime() - parseUtc(prev.ts).getTime() <=
                GAP_MS
            ) {
              last.push(point)
            } else {
              segments.push([point])
            }
          }
          return segments.map((segment, i) => {
            const coords = segment.map(
              (p) => `${x(parseUtc(p.ts).getTime())},${y(value(p))}`
            )
            // Un punto aislado se dibuja como raya corta para que se vea.
            if (coords.length === 1) coords.push(coords[0])
            return (
              <polyline
                key={`${platform}-${i}`}
                points={coords.join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dash}
                vectorEffect="non-scaling-stroke"
                className={text}
              />
            )
          })
        })}
      </svg>
    </figure>
  )
}

const ROWS: {
  label: string
  hint?: string
  get: (s: PlatformSummary) => string
}[] = [
  {
    label: "Sesiones simultáneas (máx.)",
    get: (s) => num(s.sessions_max, 0),
  },
  {
    label: "CPU media / máx.",
    get: (s) => `${num(s.cpu_avg)} / ${num(s.cpu_max)} %`,
  },
  { label: "RAM máx.", get: (s) => `${num(s.rss_max_mb)} MB` },
  {
    label: "CPU por sesión",
    hint: "% de un núcleo, estimado",
    get: (s) => `${num(s.cpu_per_session, 2)} %`,
  },
  {
    label: "RAM por sesión",
    hint: "estimado sobre la RAM en reposo",
    get: (s) => `${num(s.mb_per_session)} MB`,
  },
  {
    label: "Tráfico por sesión",
    hint: "ambos sentidos",
    get: (s) => `${num(s.kbps_per_session, 0)} kbps`,
  },
  {
    label: "Retraso del servidor (máx.)",
    hint: "event loop",
    get: (s) => `${num(s.loop_lag_max_ms, 0)} ms`,
  },
]

function Comparison({ metrics }: { metrics: Metrics }) {
  const platforms = Object.keys(metrics.summary)
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th scope="col" className="px-4 py-2 font-medium">
              Medida
            </th>
            {platforms.map((platform) => (
              <th
                key={platform}
                scope="col"
                className={cn(
                  "px-4 py-2 text-right font-medium",
                  styleOf(platform).text
                )}
              >
                {styleOf(platform).label}
                <span className="block font-mono font-normal text-muted-foreground tabular-nums">
                  {metrics.summary[platform].samples} muestras
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="px-4 py-2 text-left font-normal">
                {row.label}
                {row.hint && (
                  <span className="block text-xs text-muted-foreground">
                    {row.hint}
                  </span>
                )}
              </th>
              {platforms.map((platform) => (
                <td
                  key={platform}
                  className="px-4 py-2 text-right font-mono tabular-nums"
                >
                  {row.get(metrics.summary[platform])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Capacidad del backend por plataforma (Render, AWS) para dimensionar y comparar. */
export function CapacitySection() {
  const [hours, setHours] = useState<number>(6)
  const metrics = useMetrics(hours)

  const grouped: Record<string, MetricPoint[]> = {}
  for (const point of metrics.data?.series ?? []) {
    ;(grouped[point.platform] ??= []).push(point)
  }
  const times = (metrics.data?.series ?? []).map((p) =>
    parseUtc(p.ts).getTime()
  )
  const from = times.length ? Math.min(...times) : 0
  const to = times.length ? Math.max(...times) : 1

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <Gauge className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="text-base font-medium">Capacidad del servidor</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              CPU, RAM y tráfico del proceso del backend, medidos igual en cada
              plataforma para compararlas.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-sm tabular-nums" aria-live="polite">
            <span className="text-muted-foreground">En vivo: </span>
            {metrics.data?.live_sessions ?? "—"}{" "}
            {metrics.data?.live_sessions === 1 ? "sesión" : "sesiones"}
          </p>
          <div role="group" aria-label="Rango de tiempo" className="flex gap-1">
            {RANGES.map((range) => (
              <Button
                key={range.hours}
                size="sm"
                variant={hours === range.hours ? "default" : "outline"}
                aria-pressed={hours === range.hours}
                onClick={() => setHours(range.hours)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {metrics.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : metrics.error && !metrics.data ? (
          <p className="text-sm text-destructive" role="alert">
            No se pudieron cargar las métricas: {metrics.error.message}
          </p>
        ) : metrics.data.series.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Aún no hay muestras en este rango. El backend guarda una cada 30
            segundos mientras está despierto; si Render estaba dormido, no hay
            datos de ese tramo.
          </p>
        ) : (
          <div className="space-y-6">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
              {Object.keys(grouped).map((platform) => (
                <li
                  key={platform}
                  className={cn(
                    "flex items-center gap-2",
                    styleOf(platform).text
                  )}
                >
                  <svg width="22" height="6" aria-hidden="true">
                    <line
                      x1="0"
                      y1="3"
                      x2="22"
                      y2="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={styleOf(platform).dash}
                    />
                  </svg>
                  <span className="text-foreground">
                    {styleOf(platform).label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <LineChart
                title="CPU"
                unit="%"
                series={grouped}
                value={(p) => p.cpu_pct}
                from={from}
                to={to}
              />
              <LineChart
                title="RAM"
                unit="MB"
                series={grouped}
                value={(p) => p.rss_mb}
                from={from}
                to={to}
              />
              <LineChart
                title="Sesiones activas"
                unit=""
                series={grouped}
                value={(p) => p.active_sessions}
                from={from}
                to={to}
              />
              <LineChart
                title="Tráfico"
                unit="kbps"
                series={grouped}
                value={(p) => p.kbps_up + p.kbps_down}
                from={from}
                to={to}
              />
            </div>
            <Comparison metrics={metrics.data} />
          </div>
        )}
      </div>
    </div>
  )
}
