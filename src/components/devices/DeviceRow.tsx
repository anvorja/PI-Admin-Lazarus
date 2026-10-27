import { ChevronRight, Smartphone, Unplug } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useRef, useState } from "react"

import { DeviceMenu } from "@/components/devices/DeviceMenu"
import { StatusChip } from "@/components/devices/StatusChip"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDeviceActions } from "@/hooks/useDeviceActions"
import type { Device } from "@/lib/api/schemas"
import {
  deviceLabel,
  formatMinutes,
  formatRelative,
  formatSeconds,
} from "@/lib/format"
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
  const reduce = useReducedMotion()
  const ping = device.latency_median_ms
  const unnamed = !device.name.trim()
  const limit = device.daily_minutes_limit

  return (
    <motion.li
      layout={reduce ? false : "position"}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onSeen}
      onFocusCapture={onSeen}
      className={cn(
        "group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 rounded-lg border px-4 py-3.5 transition-[background-color,border-color,box-shadow] duration-500",
        "@3xl:grid-cols-[auto_minmax(0,1fr)_9rem_4.5rem_7rem_11.5rem] @3xl:gap-x-5",
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
        <DeviceSpecs device={device} />
      </button>

      <div className="col-span-3 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 @3xl:col-span-1 @3xl:row-start-auto @3xl:flex-col @3xl:items-start @3xl:gap-1">
        <StatusChip device={device} />
        <span className="text-xs text-muted-foreground">
          Visto {formatRelative(device.last_seen_at)}
        </span>
        <span className="text-xs text-muted-foreground @3xl:hidden">
          <span className="tabular font-mono">
            {formatMinutes(device.minutes_today)}
          </span>{" "}
          hoy
          {ping !== null ? (
            <>
              , ping{" "}
              <span className="tabular font-mono">{formatSeconds(ping)}</span>
            </>
          ) : null}
        </span>
      </div>

      <div className="hidden text-right @3xl:block">
        <p className="tabular font-mono text-sm">
          {ping !== null ? formatSeconds(ping) : "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          {ping !== null ? "ping" : "sin ping"}
        </p>
      </div>

      <div className="hidden text-right @3xl:block">
        <p className="tabular font-mono text-sm whitespace-nowrap">
          {limit
            ? `${Math.round(device.minutes_today)} / ${limit} min`
            : formatMinutes(device.minutes_today)}
        </p>
        <p className="text-xs text-muted-foreground">hoy</p>
      </div>

      <div className="col-start-3 row-start-1 flex items-center gap-2 justify-self-end @3xl:col-start-auto @3xl:row-start-auto">
        {device.status === "pending" ? (
          <Button
            size="sm"
            variant="signal"
            onClick={actions.approve}
            disabled={actions.busy}
          >
            Aprobar
          </Button>
        ) : device.active ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={actions.closeSession}
              disabled={actions.busy}
              className="hidden sm:inline-flex"
            >
              <Unplug /> Cerrar sesión
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={actions.closeSession}
              disabled={actions.busy}
              aria-label={`Cerrar sesión de ${deviceLabel(device)}`}
              className="sm:hidden"
            >
              <Unplug />
            </Button>
          </>
        ) : null}
        <DeviceMenu device={device} actions={actions} />
      </div>
    </motion.li>
  )
}

/** Modelo, Android, versión de la app e IP. En escritorio la línea se corta
 * y el tooltip la muestra completa solo si no cabe; en el teléfono, donde no
 * hay tooltip, se parte en dos líneas. */
function DeviceSpecs({ device }: { device: Device }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const specs = [
    device.model || "Modelo desconocido",
    `Android ${device.android || "?"}`,
    `app ${device.app_version || "?"}`,
    ...(device.last_ip ? [`IP ${device.last_ip}`] : []),
  ]

  const cut = () => {
    const el = ref.current
    return el !== null && el.scrollWidth > el.clientWidth
  }

  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && cut())}>
      <TooltipTrigger asChild>
        <span
          ref={ref}
          className="mt-0.5 block font-mono text-xs break-words text-muted-foreground sm:truncate"
        >
          {specs.join(", ")}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start">
        <ul className="font-mono">
          {specs.map((spec) => (
            <li key={spec}>{spec}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}
