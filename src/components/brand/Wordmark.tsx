import { Power } from "lucide-react"

/** Marca del panel: el encendido es el gesto central de la consola. */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full border border-signal/50 bg-signal-soft text-signal">
        <Power className="size-4" strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-semibold tracking-tight">Lazarus</span>
        <span className="text-xs text-muted-foreground">
          Consola del piloto
        </span>
      </span>
    </span>
  )
}
