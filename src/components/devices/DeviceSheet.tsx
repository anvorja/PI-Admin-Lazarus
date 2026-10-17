import { Download, FileText, FileDown } from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"

import { StatusChip } from "@/components/devices/StatusChip"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeviceActions } from "@/hooks/useDeviceActions"
import { useDeviceLogs, useDeviceSessions } from "@/hooks/useDevices"
import { downloadDeviceLogs } from "@/lib/api/admin"
import type { Device } from "@/lib/api/schemas"
import {
  closeReason,
  deviceLabel,
  formatBytes,
  formatDateTime,
  formatMinutes,
  formatRelative,
} from "@/lib/format"

interface DeviceSheetProps {
  device: Device | undefined
  onClose: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t px-6 py-5">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  )
}

function Latency({ id }: { id: number }) {
  const logs = useDeviceLogs(id)
  if (logs.isPending) return <Skeleton className="h-14 w-40" />
  if (logs.isError) {
    return <p className="text-sm text-muted-foreground">{logs.error.message}</p>
  }
  const { count, median_ms, p90_ms } = logs.data.latency
  if (!count || median_ms === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin datos todavía: llegan con la telemetría de sus logs.
      </p>
    )
  }
  return (
    <div className="flex items-end gap-8">
      <div>
        <p className="tabular font-mono text-4xl font-medium tracking-tight">
          {(median_ms / 1000).toFixed(1)}
          <span className="ml-1 text-lg text-muted-foreground">s</span>
        </p>
        <p className="text-xs text-muted-foreground">mediana voz a voz</p>
      </div>
      <div>
        <p className="tabular font-mono text-xl">
          {p90_ms !== null ? `${(p90_ms / 1000).toFixed(1)} s` : "?"}
        </p>
        <p className="text-xs text-muted-foreground">p90</p>
      </div>
      <p className="ml-auto text-xs text-muted-foreground">
        {count} respuestas
      </p>
    </div>
  )
}

function Logs({ device }: { device: Device }) {
  const logs = useDeviceLogs(device.id)
  const [downloading, setDownloading] = useState(false)
  if (logs.isPending) return <Skeleton className="h-20 w-full" />
  if (logs.isError) {
    return <p className="text-sm text-muted-foreground">{logs.error.message}</p>
  }
  if (!logs.data.files.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Este teléfono no ha subido logs. Se suben solos al tocar Detener, o
        pídelos desde el menú.
      </p>
    )
  }
  const download = async () => {
    setDownloading(true)
    try {
      await downloadDeviceLogs(device.id)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo descargar"
      )
    } finally {
      setDownloading(false)
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {logs.data.files.map((file) => (
          <li key={file.name} className="flex items-center gap-3 text-sm">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs">
              {file.name}
            </span>
            <span className="tabular font-mono text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Última subida {formatRelative(device.last_upload_at)}. Llevan voz
        transcrita y ubicaciones: guárdalos fuera de repositorios públicos.
      </p>
      <Button onClick={download} disabled={downloading} className="self-start">
        <Download /> {downloading ? "Preparando…" : "Descargar .zip"}
      </Button>
    </div>
  )
}

function Sessions({ id }: { id: number }) {
  const sessions = useDeviceSessions(id)
  if (sessions.isPending) return <Skeleton className="h-24 w-full" />
  if (sessions.isError) {
    return (
      <p className="text-sm text-muted-foreground">{sessions.error.message}</p>
    )
  }
  if (!sessions.data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no ha abierto sesiones.
      </p>
    )
  }
  return (
    <ol className="flex flex-col">
      {sessions.data.slice(0, 12).map((s) => (
        <li
          key={s.id}
          className="grid grid-cols-[1fr_auto] gap-x-3 border-b py-2.5 text-sm last:border-b-0"
        >
          <span>{formatDateTime(s.started_at)}</span>
          <span className="tabular text-right font-mono">
            {s.ended_at ? formatMinutes(s.duration_s / 60) : "en curso"}
          </span>
          <span className="text-xs text-muted-foreground">
            {closeReason(s.close_code, s.ended_at !== null)}
          </span>
          <span className="text-right font-mono text-xs text-muted-foreground">
            {s.ip}
          </span>
        </li>
      ))}
    </ol>
  )
}

function Body({ device }: { device: Device }) {
  const actions = useDeviceActions(device)
  return (
    <>
      <SheetHeader className="gap-3 px-6 pt-6 pr-14 pb-5">
        <div className="self-start">
          <StatusChip device={device} />
        </div>
        <SheetTitle className="text-2xl font-semibold tracking-tight">
          {deviceLabel(device)}
        </SheetTitle>
        <SheetDescription className="font-mono text-xs">
          {device.model || "Modelo desconocido"}, Android{" "}
          {device.android || "?"}, app {device.app_version || "?"}. IP{" "}
          {device.last_ip || "?"}, visto {formatRelative(device.last_seen_at)}.
        </SheetDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          {device.status === "pending" ? (
            <Button onClick={actions.approve} disabled={actions.busy}>
              Aprobar
            </Button>
          ) : null}
          {device.active ? (
            <Button
              variant="outline"
              onClick={actions.closeSession}
              disabled={actions.busy}
            >
              Cerrar sesión
            </Button>
          ) : null}
          {device.status === "approved" && !device.upload_requested ? (
            <Button
              variant="outline"
              onClick={actions.requestLogs}
              disabled={actions.busy}
            >
              <FileDown /> Pedir logs
            </Button>
          ) : null}
        </div>
      </SheetHeader>

      <Section title="Hoy">
        <p className="text-sm">
          <span className="tabular font-mono">
            {formatMinutes(device.minutes_today)}
          </span>{" "}
          de sesión
          {device.daily_minutes_limit ? (
            <>
              {" "}
              de{" "}
              <span className="tabular font-mono">
                {device.daily_minutes_limit} min
              </span>{" "}
              permitidos.
            </>
          ) : (
            ", sin límite diario."
          )}
        </p>
      </Section>
      <Section title="Latencia">
        <Latency id={device.id} />
      </Section>
      <Section title="Logs de campo">
        <Logs device={device} />
      </Section>
      <Section title="Últimas sesiones">
        <Sessions id={device.id} />
      </Section>
    </>
  )
}

/** Detalle del teléfono en una hoja lateral (en el celular, a pantalla completa). */
export function DeviceSheet({ device, onClose }: DeviceSheetProps) {
  return (
    <Sheet
      open={device !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        {device ? <Body device={device} /> : null}
      </SheetContent>
    </Sheet>
  )
}
