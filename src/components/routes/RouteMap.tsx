import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { useEffect, useMemo, useRef } from "react"
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet"

import { Button } from "@/components/ui/button"
import type { RoutePoint } from "@/hooks/useRouteDraft"
import type { FieldNote, Track } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

export interface PositionedNote extends FieldNote {
  lat: number
  lon: number
}

interface Props {
  points: RoutePoint[]
  selected: number | null
  onSelect: (index: number) => void
  onMove: (index: number, lat: number, lon: number) => void
  /** Si no es null, el próximo toque en el mapa pone un punto ahí. */
  placing: boolean
  onPlace: (lat: number, lon: number) => void
  notes: PositionedNote[]
  focusedNote: PositionedNote | null
  onNoteAction: (note: PositionedNote, action: "insert" | "move") => void
  track: Track["points"]
}

function pinIcon(number: number, point: RoutePoint, selected: boolean) {
  const tone =
    point.crossing || point.risk === "high"
      ? "danger"
      : point.risk === "medium"
        ? "caution"
        : "plain"
  return L.divIcon({
    className: "",
    html: `<span class="route-pin" data-tone="${tone}" data-selected="${selected}">${number}</span>`,
    iconSize: selected ? [34, 34] : [26, 26],
    iconAnchor: selected ? [17, 17] : [13, 13],
  })
}

/** Ajusta la vista al recorrido la primera vez y sigue al punto elegido. */
function Viewport({
  points,
  selected,
  focusedNote,
  fallback,
}: {
  points: RoutePoint[]
  selected: number | null
  focusedNote: PositionedNote | null
  fallback: [number, number][]
}) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current) return
    const coords: [number, number][] = points.length
      ? points.map((p) => [p.lat, p.lon])
      : fallback
    if (coords.length === 0) return
    fitted.current = true
    map.fitBounds(L.latLngBounds(coords), { padding: [32, 32], maxZoom: 19 })
  }, [map, points, fallback])

  useEffect(() => {
    if (selected === null) return
    const p = points[selected]
    if (!p) return
    const at = L.latLng(p.lat, p.lon)
    if (!map.getBounds().pad(-0.15).contains(at)) map.panTo(at)
    // Solo al cambiar de punto, no al arrastrarlo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selected])

  useEffect(() => {
    if (!focusedNote) return
    map.setView([focusedNote.lat, focusedNote.lon], Math.max(map.getZoom(), 18))
  }, [map, focusedNote])

  return null
}

function ClickToPlace({
  placing,
  onPlace,
}: {
  placing: boolean
  onPlace: (lat: number, lon: number) => void
}) {
  const map = useMapEvents({
    click(event) {
      if (placing) onPlace(event.latlng.lat, event.latlng.lng)
    },
  })
  useEffect(() => {
    map.getContainer().style.cursor = placing ? "crosshair" : ""
  }, [map, placing])
  return null
}

const time = (at: string) => at.slice(11, 16)

/** Mapa del perfil: puntos numerados que se arrastran, notas de campo y el
 * recorrido GPS del día. El editor accesible es la lista; el mapa la acompaña. */
export function RouteMap({
  points,
  selected,
  onSelect,
  onMove,
  placing,
  onPlace,
  notes,
  focusedNote,
  onNoteAction,
  track,
}: Props) {
  const line = useMemo(
    () => points.map((p) => [p.lat, p.lon] as [number, number]),
    [points]
  )
  const trackLine = useMemo(
    () => track.map((p) => [p.lat, p.lon] as [number, number]),
    [track]
  )
  const fallback = useMemo(
    () =>
      notes.length
        ? notes.map((n) => [n.lat, n.lon] as [number, number])
        : trackLine,
    [notes, trackLine]
  )

  return (
    <MapContainer
      center={[3.4516, -76.532]}
      zoom={13}
      maxZoom={21}
      className={cn("route-map size-full", placing && "is-placing")}
      aria-label="Mapa del recorrido"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        // OpenStreetMap bloquea los mosaicos sin Referer ("Access blocked"), y
        // Netlify sirve el panel con Referrer-Policy: same-origin: aquí se
        // envía solo el origen del panel.
        referrerPolicy="strict-origin-when-cross-origin"
        maxNativeZoom={19}
        maxZoom={21}
      />
      <Viewport
        points={points}
        selected={selected}
        focusedNote={focusedNote}
        fallback={fallback}
      />
      <ClickToPlace placing={placing} onPlace={onPlace} />
      {trackLine.length > 1 && (
        <Polyline
          positions={trackLine}
          pathOptions={{ className: "gps-track" }}
        />
      )}
      {line.length > 1 && (
        <Polyline positions={line} pathOptions={{ className: "route-line" }} />
      )}
      {notes.map((note) => (
        <CircleMarker
          key={`${note.at}-${note.text}`}
          center={[note.lat, note.lon]}
          radius={note === focusedNote ? 8 : 5}
          pathOptions={{
            className: cn("note-dot", note === focusedNote && "is-focused"),
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <span className="font-mono tabular-nums">{time(note.at)}</span>{" "}
            {note.text.length > 70 ? `${note.text.slice(0, 70)}…` : note.text}
          </Tooltip>
          <Popup>
            <p className="m-0 max-w-64 text-sm">{note.text}</p>
            <p className="mt-1 mb-2 font-mono text-xs text-muted-foreground tabular-nums">
              {time(note.at)}
              {note.accuracy_m !== null &&
                ` · ±${Math.round(note.accuracy_m)} m`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" onClick={() => onNoteAction(note, "insert")}>
                Insertar como punto
              </Button>
              {selected !== null && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNoteAction(note, "move")}
                >
                  Mover el punto {selected + 1} aquí
                </Button>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {points.map((point, index) => (
        <Marker
          // El índice es la identidad: al reordenar, el número cambia con él.
          key={`${index}-${point.lat}-${point.lon}`}
          position={[point.lat, point.lon]}
          icon={pinIcon(index + 1, point, index === selected)}
          draggable
          zIndexOffset={index === selected ? 1000 : 0}
          title={`${index + 1}. ${point.name}`}
          eventHandlers={{
            click: () => onSelect(index),
            dragstart: () => onSelect(index),
            dragend: (event) => {
              const at = (event.target as L.Marker).getLatLng()
              onMove(index, at.lat, at.lng)
            },
          }}
        />
      ))}
    </MapContainer>
  )
}
