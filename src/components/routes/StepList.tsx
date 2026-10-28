import {
  ArrowDown,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  MapPinPlus,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RouteDraft, RoutePoint } from "@/hooks/useRouteDraft"
import {
  MIN_SEGMENT_M,
  TURN_HINT_DEG,
  distanceM,
  mentionsTurn,
  stepsFor,
  turnAt,
} from "@/lib/geo"
import { cn } from "@/lib/utils"

const RISKS = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
] as const

const CROSSINGS = [
  { value: null, label: "No es cruce" },
  { value: "traffic_light", label: "Semáforo" },
  { value: "zebra", label: "Cebra" },
  { value: "uncontrolled", label: "Sin control" },
] as const

export const CROSSING_LABEL = {
  traffic_light: "Semáforo",
  zebra: "Cebra",
  uncontrolled: "Cruce sin control",
} as const

/** Lo que conviene revisar de un punto, con las reglas que aprendimos en campo. */
export function pointWarnings(points: RoutePoint[], index: number): string[] {
  const p = points[index]
  const out: string[] = []
  const prev = points[index - 1]
  const next = points[index + 1]
  if (prev && next) {
    const turn = turnAt(prev, p, next)
    if (Math.abs(turn) >= TURN_HINT_DEG && !mentionsTurn(p.instruction)) {
      out.push(
        `El camino gira a la ${turn < 0 ? "izquierda" : "derecha"} (${Math.round(Math.abs(turn))}°) y la indicación no lo dice`
      )
    }
  }
  if (next && distanceM(p, next) < MIN_SEGMENT_M) {
    out.push(
      `A ${distanceM(p, next).toFixed(0)} m del siguiente: el GPS no los distingue`
    )
  }
  if (p.arrive_m >= p.approach_m) {
    out.push("La llegada debe ser menor que la aproximación")
  }
  return out
}

function Segmented<T extends string | null>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 rounded-full border px-3 text-xs transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            value === option.value
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Segment({ from, to }: { from: RoutePoint; to: RoutePoint }) {
  const meters = distanceM(from, to)
  const tight = meters < MIN_SEGMENT_M
  return (
    <div
      className="flex items-center gap-3 py-1 pl-[13px]"
      aria-label={`${stepsFor(meters)} pasos, ${meters.toFixed(0)} metros`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-7 w-0.5 rounded-full",
          tight ? "bg-wait" : "bg-border"
        )}
      />
      <span
        className={cn(
          "font-mono text-xs tabular-nums",
          tight ? "text-wait" : "text-muted-foreground"
        )}
      >
        ≈ {stepsFor(meters)} pasos · {meters.toFixed(0)} m
      </span>
    </div>
  )
}

function TurnHint({ points, index }: { points: RoutePoint[]; index: number }) {
  const prev = points[index - 1]
  const next = points[index + 1]
  if (!prev || !next) return null
  const turn = turnAt(prev, points[index], next)
  if (Math.abs(turn) < 20) return null
  const Icon = turn < 0 ? CornerUpLeft : CornerUpRight
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3.5" aria-hidden="true" />
      {turn < 0 ? "izquierda" : "derecha"}{" "}
      <span className="font-mono tabular-nums">
        {Math.round(Math.abs(turn))}°
      </span>
    </span>
  )
}

function PointForm({
  draft,
  index,
  onPlaceAfter,
}: {
  draft: RouteDraft
  index: number
  onPlaceAfter: (index: number) => void
}) {
  const point = draft.draft.points[index]
  const total = draft.draft.points.length
  const update = (patch: Partial<RoutePoint>, key?: string) =>
    draft.updatePoint(index, patch, key && `${index}:${key}`)
  const id = `punto-${index}`

  return (
    <div className="mt-3 space-y-4 border-t pt-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-nombre`}>Nombre</Label>
        <Input
          id={`${id}-nombre`}
          value={point.name}
          maxLength={80}
          onChange={(e) => update({ name: e.target.value }, "name")}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor={`${id}-indicacion`}>Indicación al llegar</Label>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {point.instruction.length}/200
          </span>
        </div>
        <textarea
          id={`${id}-indicacion`}
          value={point.instruction}
          maxLength={200}
          rows={3}
          placeholder="Gira a la izquierda; a unos 8 pasos está el cruce"
          onChange={(e) =>
            update({ instruction: e.target.value }, "instruction")
          }
          className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Riesgo</span>
        <Segmented
          label="Riesgo"
          value={point.risk}
          options={RISKS}
          onChange={(risk) => update({ risk })}
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Cruce de vía</span>
        <Segmented
          label="Cruce de vía"
          value={point.crossing}
          options={CROSSINGS}
          onChange={(crossing) =>
            update(crossing ? { crossing, risk: "high" } : { crossing: null })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-aproximacion`}>Aviso al acercarse (m)</Label>
          <Input
            id={`${id}-aproximacion`}
            type="number"
            inputMode="decimal"
            min={1}
            max={300}
            value={point.approach_m}
            onChange={(e) =>
              update({ approach_m: Number(e.target.value) || 0 }, "approach")
            }
            className="font-mono tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-llegada`}>Llegada (m)</Label>
          <Input
            id={`${id}-llegada`}
            type="number"
            inputMode="decimal"
            min={1}
            max={100}
            value={point.arrive_m}
            onChange={(e) =>
              update({ arrive_m: Number(e.target.value) || 0 }, "arrive")
            }
            className="font-mono tabular-nums"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Para corregir la posición, arrastra el punto en el mapa o usa una nota
        de campo.{" "}
        <span className="font-mono tabular-nums">
          {point.lat.toFixed(6)}, {point.lon.toFixed(6)}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={index === 0}
          onClick={() => draft.movePoint(index, index - 1)}
          aria-label="Subir el punto"
        >
          <ArrowUp /> Subir
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={index === total - 1}
          onClick={() => draft.movePoint(index, index + 1)}
          aria-label="Bajar el punto"
        >
          <ArrowDown /> Bajar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onPlaceAfter(index)}>
          <MapPinPlus /> Punto después
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => draft.removePoint(index)}
        >
          <Trash2 /> Eliminar
        </Button>
      </div>
    </div>
  )
}

/** El recorrido como una lista de pasos: punto, distancia al siguiente en
 * pasos (como los dice la app) y avisos de lo que conviene revisar. */
export function StepList({
  draft,
  selected,
  onSelect,
  onPlaceAfter,
}: {
  draft: RouteDraft
  selected: number | null
  onSelect: (index: number | null) => void
  onPlaceAfter: (index: number) => void
}) {
  const points = draft.draft.points
  const items = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (selected === null) return
    items.current[selected]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    })
  }, [selected])

  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <p className="max-w-[44ch]">
          Aún no hay puntos. Agrega el primero tocando el mapa, o abre "Notas de
          campo" e inserta las notas que dictó la persona en el recorrido.
        </p>
        <Button className="mt-3" size="sm" onClick={() => onPlaceAfter(-1)}>
          <Plus /> Agregar en el mapa
        </Button>
      </div>
    )
  }

  return (
    <div>
      <ol aria-label="Puntos del recorrido">
        {points.map((point, index) => {
          const warnings = pointWarnings(points, index)
          const open = index === selected
          return (
            <li
              key={index}
              ref={(el) => {
                items.current[index] = el
              }}
            >
              <div
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition-colors",
                  open ? "border-foreground/40 bg-card" : "hover:bg-accent/60"
                )}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => onSelect(open ? null : index)}
                  className="flex w-full items-start gap-3 rounded-md text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full border-2 font-mono text-xs font-semibold tabular-nums",
                      point.crossing || point.risk === "high"
                        ? "border-halt text-halt"
                        : point.risk === "medium"
                          ? "border-wait"
                          : "border-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {point.name}
                    </span>
                    {point.instruction ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                        {point.instruction}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-xs text-muted-foreground/70 italic">
                        Sin indicación
                      </span>
                    )}
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {point.crossing && (
                        <span className="text-xs font-medium text-halt">
                          {CROSSING_LABEL[point.crossing]}
                        </span>
                      )}
                      <TurnHint points={points} index={index} />
                      {warnings.length > 0 && !open && (
                        <span className="inline-flex items-center gap-1 text-xs text-wait">
                          <TriangleAlert
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          {warnings.length === 1
                            ? "1 aviso"
                            : `${warnings.length} avisos`}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
                {open && warnings.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {warnings.map((w) => (
                      <li
                        key={w}
                        className="flex gap-2 rounded-md bg-wait-soft px-2.5 py-1.5 text-xs text-wait"
                      >
                        <TriangleAlert
                          className="mt-px size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
                {open && (
                  <PointForm
                    draft={draft}
                    index={index}
                    onPlaceAfter={onPlaceAfter}
                  />
                )}
              </div>
              {index < points.length - 1 && (
                <Segment from={point} to={points[index + 1]} />
              )}
            </li>
          )
        })}
      </ol>
      <Button
        className="mt-3"
        size="sm"
        variant="outline"
        onClick={() => onPlaceAfter(points.length - 1)}
      >
        <Plus /> Agregar al final, en el mapa
      </Button>
    </div>
  )
}
