import { CalendarClock } from "lucide-react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Schedule } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

const DAYS = [
  { value: 0, short: "L", long: "lunes" },
  { value: 1, short: "M", long: "martes" },
  { value: 2, short: "X", long: "miércoles" },
  { value: 3, short: "J", long: "jueves" },
  { value: 4, short: "V", long: "viernes" },
  { value: 5, short: "S", long: "sábado" },
  { value: 6, short: "D", long: "domingo" },
] as const

function same(a: Schedule, b: Schedule): boolean {
  return (
    a.enabled === b.enabled &&
    a.from === b.from &&
    a.to === b.to &&
    a.days.length === b.days.length &&
    a.days.every((d) => b.days.includes(d))
  )
}

interface ScheduleEditorProps {
  schedule: Schedule
  saving: boolean
  onSave: (schedule: Schedule) => void
}

/** Horario de las jornadas de campo, en hora de Colombia. */
export function ScheduleEditor({
  schedule,
  saving,
  onSave,
}: ScheduleEditorProps) {
  const [draft, setDraft] = useState<Schedule>(schedule)
  const id = useId()

  // Si el horario cambia en el servidor y aquí no hay cambios sin guardar, se
  // toma el nuevo (ajuste durante el render, sin efecto).
  const [base, setBase] = useState<Schedule>(schedule)
  if (!same(schedule, base)) {
    setBase(schedule)
    if (same(draft, base)) setDraft(schedule)
  }

  const dirty = !same(draft, schedule)
  const invalid =
    draft.enabled && (draft.days.length === 0 || draft.from >= draft.to)

  const toggleDay = (day: number) =>
    setDraft((d) => ({
      ...d,
      days: d.days.includes(day)
        ? d.days.filter((x) => x !== day)
        : [...d.days, day].sort(),
    }))

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (!invalid) onSave(draft)
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <Label htmlFor={`${id}-enabled`} className="text-base font-medium">
              Solo en el horario de las jornadas
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Fuera de estos días y horas el servicio no abre, aunque esté
              encendido.
            </p>
          </div>
        </div>
        <Switch
          id={`${id}-enabled`}
          checked={draft.enabled}
          onCheckedChange={(enabled) => setDraft((d) => ({ ...d, enabled }))}
        />
      </div>

      <fieldset
        disabled={!draft.enabled}
        className="flex flex-col gap-4 transition-opacity disabled:opacity-45"
      >
        <legend className="sr-only">Días y horas</legend>
        <div
          className="flex justify-between gap-1.5"
          role="group"
          aria-label="Días"
        >
          {DAYS.map((day) => {
            const on = draft.days.includes(day.value)
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={on}
                aria-label={day.long}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "grid size-10 place-items-center rounded-full border text-sm font-medium transition-colors",
                  on
                    ? "border-signal/60 bg-signal-soft text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {day.short}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-from`}>Desde</Label>
            <Input
              id={`${id}-from`}
              type="time"
              value={draft.from}
              onChange={(e) =>
                setDraft((d) => ({ ...d, from: e.target.value }))
              }
              className="tabular font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-to`}>Hasta</Label>
            <Input
              id={`${id}-to`}
              type="time"
              value={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              className="tabular font-mono"
            />
          </div>
        </div>
      </fieldset>

      {invalid ? (
        <p className="text-sm text-destructive" role="alert">
          Elige al menos un día y una hora de inicio anterior a la de cierre.
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {dirty ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraft(schedule)}
          >
            Descartar
          </Button>
        ) : null}
        <Button type="submit" disabled={!dirty || invalid || saving}>
          {saving ? "Guardando…" : "Guardar horario"}
        </Button>
      </div>
    </form>
  )
}
