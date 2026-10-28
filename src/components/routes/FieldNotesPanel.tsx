import { MapPinPlus, Move, Smartphone } from "lucide-react"

import type { PositionedNote } from "@/components/routes/RouteMap"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import type { Device, FieldNote, Track } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

export function hasPosition(note: FieldNote): note is PositionedNote {
  return note.lat !== null && note.lon !== null
}

const time = (at: string) => at.slice(11, 19)

/** Notas que dictó la persona en el recorrido y el recorrido GPS del día, para
 * convertirlas en puntos o corregir la posición de uno. */
export function FieldNotesPanel({
  devices,
  deviceId,
  onDevice,
  track,
  day,
  onDay,
  showTrack,
  onShowTrack,
  notes,
  loading,
  error,
  focused,
  onFocus,
  selected,
  onAction,
}: {
  devices: Device[]
  deviceId: number | undefined
  onDevice: (id: number | undefined) => void
  track: Track | undefined
  day: string | undefined
  onDay: (day: string) => void
  showTrack: boolean
  onShowTrack: (show: boolean) => void
  notes: FieldNote[]
  loading: boolean
  error: Error | null
  focused: PositionedNote | null
  onFocus: (note: PositionedNote) => void
  selected: number | null
  onAction: (note: PositionedNote, action: "insert" | "move") => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div data-guide="telefono" className="space-y-1.5">
          <Label htmlFor="notas-telefono">Teléfono</Label>
          <select
            id="notas-telefono"
            className={selectClass}
            value={deviceId ?? ""}
            onChange={(e) =>
              onDevice(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Elige uno</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || d.model || `Teléfono ${d.id}`}
              </option>
            ))}
          </select>
        </div>
        <div data-guide="dia" className="space-y-1.5">
          <Label htmlFor="notas-dia">Día</Label>
          <select
            id="notas-dia"
            className={cn(selectClass, "font-mono tabular-nums")}
            value={day ?? ""}
            disabled={!track?.days.length}
            onChange={(e) => onDay(e.target.value)}
          >
            {!track?.days.length && <option value="">—</option>}
            {track?.days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div data-guide="gps" className="flex items-center justify-between gap-3">
        <Label
          htmlFor="notas-recorrido"
          className="font-normal text-muted-foreground"
        >
          Mostrar el recorrido GPS del día
        </Label>
        <Switch
          id="notas-recorrido"
          checked={showTrack}
          onCheckedChange={onShowTrack}
          disabled={!track?.points.length}
        />
      </div>

      {deviceId === undefined ? (
        <div className="flex gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <Smartphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="max-w-[44ch]">
            Elige el teléfono que hizo el recorrido. Sus notas aparecen aquí y
            en el mapa; cada una se puede insertar como punto o usar para mover
            uno.
          </p>
        </div>
      ) : loading ? (
        <Skeleton className="h-32 w-full" />
      ) : error ? (
        <p className="text-sm text-destructive" role="alert">
          No se pudieron cargar las notas: {error.message}
        </p>
      ) : notes.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Este teléfono no tiene notas ese día. Suben al panel al tocar Detener
          o poco después de dictarlas.
        </p>
      ) : (
        <ol
          data-guide="notas"
          className="space-y-1.5"
          aria-label="Notas de campo"
        >
          {notes.map((note) => {
            const positioned = hasPosition(note)
            const isFocused = positioned && focused === note
            return (
              <li
                key={`${note.at}-${note.text}`}
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition-colors",
                  isFocused ? "border-wait bg-wait-soft" : "hover:bg-accent/60"
                )}
              >
                <button
                  type="button"
                  disabled={!positioned}
                  onClick={() => positioned && onFocus(note)}
                  className="w-full rounded-md text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default"
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {time(note.at)}
                    {positioned
                      ? note.accuracy_m !== null &&
                        ` · ±${Math.round(note.accuracy_m)} m`
                      : " · sin posición"}
                    {note.heading !== null && ` · ${Math.round(note.heading)}°`}
                  </span>
                  <span className="mt-0.5 block text-sm">{note.text}</span>
                </button>
                {isFocused && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button size="sm" onClick={() => onAction(note, "insert")}>
                      <MapPinPlus /> Insertar como punto
                    </Button>
                    {selected !== null && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAction(note, "move")}
                      >
                        <Move /> Mover el punto {selected + 1} aquí
                      </Button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
