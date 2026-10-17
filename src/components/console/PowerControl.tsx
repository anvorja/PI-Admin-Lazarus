import { Power } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { ServiceSettings } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

type Phase = "open" | "scheduled" | "closed"

function phaseOf(settings: ServiceSettings): Phase {
  if (settings.open_now) return "open"
  return settings.service_open ? "scheduled" : "closed"
}

const COPY: Record<Phase, { title: string; body: string }> = {
  open: {
    title: "Abierto",
    body: "Los teléfonos aprobados pueden usar Lazarus ahora.",
  },
  scheduled: {
    title: "Fuera de horario",
    body: "Se abre solo en el horario de las jornadas. Ahora nadie puede empezar.",
  },
  closed: {
    title: "Cerrado",
    body: "Nadie puede empezar una sesión. No se gasta saldo.",
  },
}

interface PowerControlProps {
  settings: ServiceSettings
  liveCount: number
  busy: boolean
  onToggle: (open: boolean) => void
}

/**
 * El botón de encendido del servicio, como el de conectar en una app de VPN:
 * el estado se lee de lejos y se cambia con un toque. Cerrar con teléfonos en
 * sesión pide confirmación.
 */
export function PowerControl({
  settings,
  liveCount,
  busy,
  onToggle,
}: PowerControlProps) {
  const reduce = useReducedMotion()
  const [confirming, setConfirming] = useState(false)
  const phase = phaseOf(settings)
  const isOn = settings.service_open
  const live = phase === "open" && liveCount > 0

  const press = () => {
    if (isOn && liveCount > 0) {
      setConfirming(true)
      return
    }
    onToggle(!isOn)
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative grid size-56 place-items-center">
        {live && !reduce ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-signal"
            initial={{ scale: 0.86, opacity: 0.6 }}
            animate={{ scale: 1.06, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
        ) : null}
        <span
          aria-hidden
          className={cn(
            "absolute inset-3 rounded-full border transition-colors duration-500",
            phase === "open" && "border-signal/45",
            phase === "scheduled" && "border-wait/45",
            phase === "closed" && "border-border"
          )}
        />
        <motion.button
          type="button"
          onClick={press}
          disabled={busy}
          aria-pressed={isOn}
          aria-label={isOn ? "Cerrar el servicio" : "Abrir el servicio"}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          className={cn(
            "relative grid size-40 place-items-center rounded-full border transition-[background-color,border-color,box-shadow,color] duration-500 ease-out-expo",
            "focus-visible:outline-offset-4 disabled:cursor-progress",
            phase === "open" &&
              "border-signal/60 bg-signal-soft text-signal shadow-[0_18px_50px_-18px_var(--signal)]",
            phase === "scheduled" &&
              "border-wait/50 bg-wait-soft text-wait shadow-[0_18px_50px_-22px_var(--wait)]",
            phase === "closed" &&
              "border-border bg-card text-muted-foreground shadow-[0_18px_40px_-24px_oklch(0.2_0.03_260/45%)] hover:text-foreground"
          )}
        >
          <Power
            className={cn("size-14", busy && "animate-pulse")}
            strokeWidth={1.75}
          />
        </motion.button>
      </div>

      <div className="flex flex-col items-center gap-1.5" aria-live="polite">
        <p className="text-3xl font-semibold tracking-tight">
          {COPY[phase].title}
        </p>
        <p className="max-w-[30ch] text-sm text-balance text-muted-foreground">
          {COPY[phase].body}
        </p>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar el servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              {liveCount === 1
                ? "Hay un teléfono en sesión."
                : `Hay ${liveCount} teléfonos en sesión.`}{" "}
              Sus sesiones siguen hasta que terminen; nadie más podrá empezar.
              Para cortarlas ya, usa "Cerrar sesión" en cada teléfono.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Dejar abierto</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => onToggle(false)}
            >
              Cerrar el servicio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
