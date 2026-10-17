import { ChevronRight, Smartphone, Unplug } from "lucide-react"

import { DeviceMenu } from "@/components/devices/DeviceMenu"
import { StatusChip } from "@/components/devices/StatusChip"
import { Button } from "@/components/ui/button"
import { useDeviceActions } from "@/hooks/useDeviceActions"
import type { Device } from "@/lib/api/schemas"
import { deviceLabel, formatMinutes, formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

interface DeviceRowProps {
  device: Device
  highlighted: boolean
  onSeen: () => void
  onOpen: () => void
}

/** Un teléfono en la lista, como un servidor en una app de VPN. */
export function DeviceRow({
  device,
  highlighted,
  onSeen,
  onOpen,
}: DeviceRowProps) {
  const actions = useDeviceActions(device)
  const unnamed = !device.name.trim()
  const limit = device.daily_minutes_limit

  return (
    <li
      onMouseEnter={onSeen}
      onFocusCapture={onSeen}
      className={cn(
        "group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 rounded-2xl border px-4 py-3.5 transition-[background-color,border-color,box-shadow] duration-500",
        "md:grid-cols-[auto_minmax(0,1fr)_10.5rem_8rem_9.5rem]",
        highlighted
          ? "border-signal/50 bg-signal-soft shadow-[0_10px_30px_-18px_var(--signal)]"
          : "border-transparent hover:border-border hover:bg-card/70"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-11 place-items-center rounded-xl border",
          device.active
            ? "border-signal/40 bg-signal-soft text-signal"
            : device.status === "pending"
              ? "border-wait/40 bg-wait-soft text-wait"
              : "bg-card text-muted-foreground"
        )}
      >
        <Smartphone className="size-5" strokeWidth={1.75} />
      </span>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 rounded-md text-left outline-offset-4"
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "truncate font-medium",
              unnamed && "text-muted-foreground italic"
            )}
          >
            {unnamed
              ? `Sin nombre (${device.model || "teléfono"})`
              : deviceLabel(device)}
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
          {device.model || "Modelo desconocido"}, Android{" "}
          {device.android || "?"}, app {device.app_version || "?"}
        </span>
      </button>

      <div className="col-span-3 row-start-2 flex items-center gap-3 md:col-span-1 md:row-start-auto md:flex-col md:items-start md:gap-1">
        <StatusChip device={device} />
        <span className="text-xs text-muted-foreground">
          Visto {formatRelative(device.last_seen_at)}
        </span>
      </div>

      <div className="hidden text-right md:block">
        <p className="tabular font-mono text-sm">
          {formatMinutes(device.minutes_today)}
          {limit ? (
            <span className="text-muted-foreground"> / {limit} min</span>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">hoy</p>
      </div>

      <div className="col-start-3 row-start-1 flex items-center gap-1 justify-self-end md:col-start-auto md:row-start-auto">
        {device.status === "pending" ? (
          <Button size="sm" onClick={actions.approve} disabled={actions.busy}>
            Aprobar
          </Button>
        ) : device.active ? (
          <Button
            size="sm"
            variant="outline"
            onClick={actions.closeSession}
            disabled={actions.busy}
            className="hidden sm:inline-flex"
          >
            <Unplug /> Cerrar sesión
          </Button>
        ) : null}
        <DeviceMenu device={device} actions={actions} />
      </div>
    </li>
  )
}
