import { Smartphone } from "lucide-react"
import { useMemo, useState } from "react"

import { deviceLabel, STATUS_LABEL } from "@/lib/format"

import { DeviceRow } from "@/components/devices/DeviceRow"
import { Skeleton } from "@/components/ui/skeleton"
import { useChangeHighlight } from "@/hooks/useChangeHighlight"
import type { Device } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

type Filter = "all" | "pending" | "live" | "disabled"

const FILTERS: { id: Filter; label: string; match: (d: Device) => boolean }[] =
  [
    { id: "all", label: "Todos", match: () => true },
    {
      id: "pending",
      label: "Pendientes",
      match: (d) => d.status === "pending",
    },
    { id: "live", label: "En sesión", match: (d) => d.active },
    {
      id: "disabled",
      label: "Deshabilitados",
      match: (d) => d.status === "disabled",
    },
  ]

/** Orden estable: lo que pide atención arriba, luego por nombre. */
function rank(d: Device): number {
  if (d.status === "pending") return 0
  if (d.active) return 1
  if (d.status === "approved") return 2
  return 3
}

interface DeviceListProps {
  devices: Device[] | undefined
  loading: boolean
  error: Error | null
  onRetry: () => void
  onOpen: (id: number) => void
}

export function DeviceList({
  devices,
  loading,
  error,
  onRetry,
  onOpen,
}: DeviceListProps) {
  const [filter, setFilter] = useState<Filter>("all")
  const { changed, acknowledge } = useChangeHighlight(devices)

  const ranked = useMemo(
    () =>
      [...(devices ?? [])].sort(
        (a, b) =>
          rank(a) - rank(b) ||
          (a.name || a.model).localeCompare(b.name || b.model, "es") ||
          a.id - b.id
      ),
    [devices]
  )

  // Orden congelado: las filas se actualizan en su sitio y los teléfonos
  // nuevos entran arriba. Todo se reordena solo en la primera carga, al cambiar
  // de filtro o cuando ya se vieron todos los cambios (nunca debajo del puntero
  // de alguien que está a punto de tocar una fila).
  const [order, setOrder] = useState<number[] | null>(null)
  const [pendingSeen, setPendingSeen] = useState(0)
  const desired = ranked.map((d) => d.id)
  const present = new Set(desired)
  let nextOrder: number[]
  if (order === null || (pendingSeen > 0 && changed.size === 0)) {
    nextOrder = devices ? desired : []
  } else {
    const known = new Set(order)
    nextOrder = [
      ...desired.filter((id) => !known.has(id)),
      ...order.filter((id) => present.has(id)),
    ]
  }
  if (devices && order === null) setOrder(nextOrder)
  else if (
    order !== null &&
    (nextOrder.length !== order.length ||
      nextOrder.some((id, i) => id !== order[i]))
  ) {
    setOrder(nextOrder)
  }
  if (pendingSeen !== changed.size) setPendingSeen(changed.size)

  const byId = new Map(ranked.map((d) => [d.id, d]))
  const sorted = nextOrder.flatMap((id) => {
    const device = byId.get(id)
    return device ? [device] : []
  })
  const announcement = sorted
    .filter((d) => changed.has(d.id))
    .map(
      (d) =>
        `${deviceLabel(d)}: ${d.active ? "en sesión" : STATUS_LABEL[d.status].toLowerCase()}`
    )
    .join(". ")

  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0]
  const visible = sorted.filter(active.match)

  return (
    <section
      aria-labelledby="telefonos"
      className="flex min-w-0 flex-col gap-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="telefonos" className="text-2xl font-semibold tracking-tight">
            Teléfonos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada teléfono aparece pendiente la primera vez que abre Lazarus.
          </p>
        </div>
        <div
          role="group"
          aria-label="Filtrar teléfonos"
          className="flex max-w-full [scrollbar-width:none] gap-1 overflow-x-auto rounded-full border bg-card/60 p-1"
        >
          {FILTERS.map((f) => {
            const count = sorted.filter(f.match).length
            const selected = f.id === filter
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setFilter(f.id)
                  setOrder(desired)
                }}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-full px-3 text-sm whitespace-nowrap transition-colors",
                  selected
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                <span className="tabular font-mono text-xs opacity-70">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {loading ? (
        <ul
          className="flex flex-col gap-2"
          aria-busy="true"
          aria-label="Cargando teléfonos"
        >
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="size-11 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div
          className="rounded-lg border border-dashed px-6 py-10 text-center"
          role="alert"
        >
          <p className="font-medium">No se pudo cargar la lista.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 text-sm font-medium text-foreground underline underline-offset-4 hover:decoration-2"
          >
            Reintentar
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center">
          <Smartphone
            className="size-8 text-muted-foreground"
            strokeWidth={1.5}
          />
          <p className="font-medium">
            {filter === "all"
              ? "Todavía no hay teléfonos"
              : `Ninguno en "${active.label}"`}
          </p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            {filter === "all"
              ? "Instala el APK en un teléfono y abre Lazarus: aparecerá aquí pendiente de aprobación."
              : "Cambia el filtro para ver los demás."}
          </p>
        </div>
      ) : (
        <ul className="@container flex flex-col gap-1.5">
          {visible.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              highlighted={changed.has(device.id)}
              onSeen={() => acknowledge(device.id)}
              onOpen={() => onOpen(device.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
