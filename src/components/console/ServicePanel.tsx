import { CalendarClock, ChevronDown } from "lucide-react"
import { Collapsible } from "radix-ui"
import { useState } from "react"
import { toast } from "sonner"

import { PowerControl } from "@/components/console/PowerControl"
import { DAYS, ScheduleEditor } from "@/components/console/ScheduleEditor"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useServiceSettings,
  useUpdateSettings,
} from "@/hooks/useServiceSettings"
import type { Device, Schedule } from "@/lib/api/schemas"

interface ServicePanelProps {
  devices: Device[] | undefined
}

function Figure({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="tabular font-mono text-xl font-medium">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/** El servicio: encendido y cifras del momento. */
export function ServicePanel({ devices }: ServicePanelProps) {
  const settings = useServiceSettings()
  const update = useUpdateSettings()

  const live = devices?.filter((d) => d.active).length ?? 0
  const pending = devices?.filter((d) => d.status === "pending").length ?? 0
  const approved = devices?.filter((d) => d.status === "approved").length ?? 0

  if (settings.isPending) {
    return (
      <div className="flex flex-col items-center gap-6 py-4" aria-busy="true">
        <Skeleton className="size-56 rounded-full" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
    )
  }

  if (settings.isError) {
    return (
      <div className="flex flex-col gap-3 py-6 text-center" role="alert">
        <p className="font-medium">No se pudo leer el estado del servicio.</p>
        <p className="text-sm text-muted-foreground">
          {settings.error.message}
        </p>
        <button
          type="button"
          onClick={() => void settings.refetch()}
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:decoration-2"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const data = settings.data

  return (
    <div className="flex flex-col gap-8">
      <PowerControl
        settings={data}
        liveCount={live}
        busy={update.isPending}
        onToggle={(open) =>
          update.mutate(
            { service_open: open },
            {
              onSuccess: () =>
                toast.success(open ? "Servicio abierto" : "Servicio cerrado"),
              onError: (error) => toast.error(error.message),
            }
          )
        }
      />

      <div className="grid grid-cols-3 gap-2 border-y py-4">
        <Figure value={live} label="En sesión" />
        <Figure value={pending} label="Pendientes" />
        <Figure value={approved} label="Aprobados" />
      </div>
    </div>
  )
}

/** Horario de las jornadas (en el celular va después de la lista). */
const SCHEDULE_OPEN_KEY = "lazarus-panel-horario-abierto"

function readScheduleOpen(): boolean {
  try {
    return localStorage.getItem(SCHEDULE_OPEN_KEY) === "1"
  } catch {
    return false
  }
}

/** Lo que se ve con la sección plegada: si el horario rige y cuándo. */
function scheduleSummary(schedule: Schedule): string {
  if (!schedule.enabled) return "Desactivado: el servicio abre a cualquier hora"
  const days = DAYS.filter((d) => schedule.days.includes(d.value))
    .map((d) => d.long)
    .join(", ")
  return `${days || "Ningún día"}, de ${schedule.from} a ${schedule.to}`
}

/** El horario se usa poco: va plegado y el panel recuerda si se dejó abierto. */
export function ScheduleSection() {
  const settings = useServiceSettings()
  const update = useUpdateSettings()
  const [open, setOpen] = useState(readScheduleOpen)

  const toggle = (next: boolean) => {
    setOpen(next)
    try {
      localStorage.setItem(SCHEDULE_OPEN_KEY, next ? "1" : "0")
    } catch {
      // Sin almacenamiento solo se pierde la preferencia.
    }
  }

  if (!settings.data) {
    return settings.isPending ? <Skeleton className="h-12 w-full" /> : null
  }
  const schedule = settings.data.schedule
  return (
    <Collapsible.Root open={open} onOpenChange={toggle}>
      <Collapsible.Trigger className="group flex w-full items-start gap-3 rounded-md text-left outline-offset-4">
        <CalendarClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium">
            Horario de las jornadas
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {scheduleSummary(schedule)}
          </span>
        </span>
        <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-6">
        <ScheduleEditor
          schedule={schedule}
          saving={update.isPending}
          onSave={(next) =>
            update.mutate(
              { schedule: next },
              {
                onSuccess: () => toast.success("Horario guardado"),
                onError: (error) => toast.error(error.message),
              }
            )
          }
        />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
