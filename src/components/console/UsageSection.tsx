import { CircleAlert, CircleCheck, Loader2, Wallet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateSettings } from "@/hooks/useServiceSettings"
import { useCheckGemini, useUsage } from "@/hooks/useUsage"
import type { GeminiCheck, Usage, UsageLevel } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

const num = (value: number, digits = 1) =>
  value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

function monthLabel(month: string) {
  const [year, m] = month.split("-")
  return `${MONTHS[Number(m) - 1] ?? month} de ${year}`
}

/** El color acompaña al texto del nivel: nunca es lo único que lo dice. */
const LEVEL: Record<UsageLevel, { bar: string; text: string; word: string }> = {
  ok: { bar: "bg-signal", text: "text-signal", word: "Bien" },
  warn: { bar: "bg-wait", text: "text-wait", word: "Cerca del límite" },
  limit: { bar: "bg-destructive", text: "text-destructive", word: "Límite" },
  unset: {
    bar: "bg-muted-foreground/50",
    text: "text-muted-foreground",
    word: "Sin límite definido",
  },
}

interface MeterProps {
  label: string
  used: string
  limit: string | null
  pct: number | null
  level: UsageLevel
  warnPct: number
  detail: string
}

function Meter({
  label,
  used,
  limit,
  pct,
  level,
  warnPct,
  detail,
}: MeterProps) {
  const style = LEVEL[level]
  const width = Math.min(100, Math.max(pct ?? 0, pct ? 1.5 : 0))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("text-xs font-medium", style.text)}>
          {style.word}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
        aria-valuetext={
          limit ? `${used} de ${limit} (${num(pct ?? 0)} %)` : `${used}`
        }
        className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", style.bar)}
          style={{ width: `${width}%` }}
        />
        {limit && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-px bg-foreground/40"
            style={{ left: `${warnPct}%` }}
          />
        )}
      </div>
      <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 font-mono text-xs text-muted-foreground tabular-nums">
        <span>
          <span className="text-foreground">{used}</span>
          {limit ? ` de ${limit}` : ""}
          {pct !== null ? ` · ${num(pct)} %` : ""}
        </span>
        <span>{detail}</span>
      </p>
    </div>
  )
}

/** Lo que el coordinador tiene que saber antes de salir, en una frase cada cosa. */
function alerts(usage: Usage): string[] {
  const out: string[] = []
  if (usage.last_failure === "billing") {
    out.push(
      "Gemini rechazó una sesión reciente por saldo o facturación: revise la cuenta de Google AI Studio antes de salir."
    )
  } else if (usage.last_failure === "quota") {
    out.push(
      "Gemini rechazó una sesión reciente por cuota agotada: espere a que se renueve o suba la cuota."
    )
  }
  const { transfer, live } = usage
  if (transfer.level === "limit") {
    out.push(
      "La transferencia del backend llegó al límite del plan: Render puede suspender el servicio."
    )
  } else if (transfer.level === "warn") {
    out.push(
      `La transferencia del backend va en el ${num(transfer.pct ?? 0)} % del límite del mes.`
    )
  }
  if (live.level === "limit") {
    out.push("Se agotaron los minutos de Live presupuestados para el mes.")
  } else if (live.level === "warn") {
    out.push(
      `Los minutos de Live van en el ${num(live.pct ?? 0)} % del presupuesto del mes.`
    )
  }
  return out
}

const CHECK_TEXT: Record<GeminiCheck["status"], string> = {
  ok: "Gemini responde: la clave funciona y hay saldo.",
  billing: "Gemini rechaza la conexión por saldo o facturación.",
  quota: "Gemini rechaza la conexión por cuota agotada.",
  error: "No se pudo conectar con Gemini.",
}

function LimitsEditor({ usage, onDone }: { usage: Usage; onDone: () => void }) {
  const update = useUpdateSettings()
  const [transfer, setTransfer] = useState(String(usage.limits.transfer_gb))
  const [minutes, setMinutes] = useState(String(usage.limits.live_minutes))
  const [warn, setWarn] = useState(String(usage.limits.warn_pct))

  const values = {
    transfer_gb: Number(transfer),
    live_minutes: Number(minutes),
    warn_pct: Number(warn),
  }
  const valid =
    Number.isFinite(values.transfer_gb) &&
    values.transfer_gb >= 0 &&
    Number.isFinite(values.live_minutes) &&
    values.live_minutes >= 0 &&
    Number.isFinite(values.warn_pct) &&
    values.warn_pct >= 1 &&
    values.warn_pct <= 100

  return (
    <form
      className="mt-4 space-y-3 rounded-md border bg-muted/30 p-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        update.mutate(
          { usage_limits: values },
          {
            onSuccess: () => {
              toast.success("Límites guardados.")
              onDone()
            },
            onError: (error) => toast.error(error.message),
          }
        )
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="limit-transfer">Transferencia (GB/mes)</Label>
          <Input
            id="limit-transfer"
            inputMode="decimal"
            value={transfer}
            onChange={(e) => setTransfer(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="limit-minutes">Minutos de Live/mes</Label>
          <Input
            id="limit-minutes"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="limit-warn">Avisar desde (%)</Label>
          <Input
            id="limit-warn"
            inputMode="numeric"
            value={warn}
            onChange={(e) => setWarn(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        0 deja ese consumo sin límite. La transferencia del plan gratuito de
        Render es de 100 GB al mes; los minutos salen del presupuesto de Google
        AI Studio.
      </p>
      {!valid && (
        <p className="text-xs text-destructive" role="alert">
          Revise los valores: números de 0 en adelante y un aviso entre 1 y 100
          %.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={!valid || update.isPending}>
          {update.isPending && <Loader2 className="animate-spin" />}
          Guardar límites
        </Button>
      </div>
    </form>
  )
}

/**
 * Consumo del mes (HU-051): transferencia del backend frente al plan de Render
 * y minutos de Live frente al presupuesto, con aviso desde el % definido. El
 * 28-oct Render suspendió el servicio por la transferencia y el 29-oct Gemini
 * rechazó las sesiones por facturación: esta sección los avisa antes de salir.
 */
export function UsageSection() {
  const usage = useUsage()
  const check = useCheckGemini()
  const [editing, setEditing] = useState(false)
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)

  const result = check.data
  const warnings = usage.data ? alerts(usage.data) : []

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <Wallet className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="text-base font-medium">Consumo del mes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {usage.data
                ? `${monthLabel(usage.data.month)}, hora de Colombia.`
                : "Transferencia del backend y minutos de Live."}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            check.mutate(undefined, {
              onSuccess: () => setCheckedAt(new Date()),
            })
          }
          disabled={check.isPending}
        >
          {check.isPending && <Loader2 className="animate-spin" />}
          Probar Gemini
        </Button>
      </div>

      {(result || check.error) && (
        <p
          role="status"
          className={cn(
            "mt-4 flex items-start gap-2 rounded-md p-3 text-sm",
            result?.status === "ok"
              ? "bg-signal-soft text-foreground"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {result?.status === "ok" ? (
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-signal" />
          ) : (
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
          )}
          <span>
            {result ? CHECK_TEXT[result.status] : check.error?.message}
            {result?.detail ? ` ${result.detail}` : ""}
            {checkedAt && result && (
              <span className="text-muted-foreground">
                {" "}
                (
                {checkedAt.toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            )}
          </span>
        </p>
      )}

      <div className="mt-5">
        {usage.isPending ? (
          <Skeleton className="h-28 w-full" />
        ) : usage.error && !usage.data ? (
          <p className="text-sm text-destructive" role="alert">
            No se pudo cargar el consumo: {usage.error.message}
          </p>
        ) : (
          <div className="space-y-5">
            {warnings.length > 0 && (
              <ul
                role="alert"
                className="space-y-1.5 rounded-md border border-wait/40 bg-wait-soft p-3 text-sm"
              >
                {warnings.map((text) => (
                  <li key={text} className="flex gap-2">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-wait" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
            <Meter
              label="Transferencia del backend"
              used={`${num(usage.data.transfer.used_gb, 2)} GB`}
              limit={
                usage.data.transfer.limit_gb > 0
                  ? `${num(usage.data.transfer.limit_gb)} GB`
                  : null
              }
              pct={usage.data.transfer.pct}
              level={usage.data.transfer.level}
              warnPct={usage.data.warn_pct}
              detail={`a Gemini ${num(usage.data.transfer.to_gemini_gb, 2)} · a la app ${num(usage.data.transfer.to_app_gb, 2)}`}
            />
            <Meter
              label="Minutos de Live (API de IA)"
              used={`${num(usage.data.live.minutes)} min`}
              limit={
                usage.data.live.limit_minutes > 0
                  ? `${num(usage.data.live.limit_minutes, 0)} min`
                  : null
              }
              pct={usage.data.live.pct}
              level={usage.data.live.level}
              warnPct={usage.data.warn_pct}
              detail={`${usage.data.live.sessions} ${usage.data.live.sessions === 1 ? "sesión" : "sesiones"}`}
            />
            {editing ? (
              <LimitsEditor
                usage={usage.data}
                onDone={() => setEditing(false)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Aviso desde el {num(usage.data.warn_pct, 0)} %. La
                  transferencia es una cota inferior: no cuenta cabeceras ni
                  cifrado.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                >
                  Editar límites
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
