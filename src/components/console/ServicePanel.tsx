import { toast } from "sonner"

import { PowerControl } from "@/components/console/PowerControl"
import { ScheduleEditor } from "@/components/console/ScheduleEditor"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useServiceSettings,
  useUpdateSettings,
} from "@/hooks/useServiceSettings"
import type { Device } from "@/lib/api/schemas"

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
          className="text-sm font-medium text-signal underline-offset-4 hover:underline"
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
export function ScheduleSection() {
  const settings = useServiceSettings()
  const update = useUpdateSettings()
  if (!settings.data) {
    return settings.isPending ? <Skeleton className="h-64 w-full" /> : null
  }
  return (
    <ScheduleEditor
      schedule={settings.data.schedule}
      saving={update.isPending}
      onSave={(schedule) =>
        update.mutate(
          { schedule },
          {
            onSuccess: () => toast.success("Horario guardado"),
            onError: (error) => toast.error(error.message),
          }
        )
      }
    />
  )
}
