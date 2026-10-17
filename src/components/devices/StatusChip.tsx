import type { Device } from "@/lib/api/schemas"
import { STATUS_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Estado del teléfono; "En sesión" manda sobre "Aprobado". */
export function StatusChip({ device }: { device: Device }) {
  const live = device.active
  const label = live ? "En sesión" : STATUS_LABEL[device.status]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        live && "bg-signal-soft text-signal",
        !live && device.status === "pending" && "bg-wait-soft text-wait",
        !live &&
          device.status === "approved" &&
          "bg-muted text-muted-foreground",
        !live && device.status === "disabled" && "bg-halt-soft text-halt"
      )}
    >
      {live ? (
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
        </span>
      ) : null}
      {label}
    </span>
  )
}
