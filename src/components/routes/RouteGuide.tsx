import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Crosshair,
  Flag,
  Footprints,
  Hash,
  MapPinPlus,
  MessageSquareText,
  Radar,
  Route,
  Save,
  Smartphone,
  TrafficCone,
  TriangleAlert,
  Type,
  X,
  type LucideIcon,
} from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { useEffect, useMemo, useState, type ReactNode } from "react"

import { BranchedMenu, type BranchedMenuItem } from "@/components/BranchedMenu"
import { Button } from "@/components/ui/button"
import type { RouteProfile } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"

/** Lo que la guía necesita saber del editor para marcar el avance. */
export interface GuideProgress {
  profile: RouteProfile
  slug: string
  isNew: boolean
  dirty: boolean
  deviceId: number | undefined
  day: string | undefined
  warnings: number
  /** Temas que la persona ya abrió en la guía. */
  seen: ReadonlySet<string>
}

type Legend = "track" | "notes" | "pins" | "segment"

interface Topic {
  value: string
  label: string
  icon: LucideIcon
  title: string
  body: ReactNode
  legend?: Legend
  done: (p: GuideProgress) => boolean
}

interface Section {
  label: string
  topics: Topic[]
}

const hasPoints = (p: GuideProgress, n = 1) => p.profile.points.length >= n

export const GUIDE: Section[] = [
  {
    label: "Datos del perfil",
    topics: [
      {
        value: "nombre",
        label: "Nombre",
        icon: Type,
        title: "Nombre de la ruta",
        body: (
          <>
            <p>
              Así aparece en la consola y así la nombra la app al empezar la
              guía. Que se entienda de dónde a dónde va, por ejemplo «Paradero →
              Biblioteca (ida)».
            </p>
          </>
        ),
        done: (p) => p.profile.name.trim() !== "",
      },
      {
        value: "extremos",
        label: "Origen y destino",
        icon: Flag,
        title: "Origen y destino",
        body: (
          <p>
            Cuando la persona dice «llévame a …», la app busca la ruta por su
            destino. Escribe los dos extremos con el nombre corto que ella
            usaría en voz alta, no con la dirección.
          </p>
        ),
        done: (p) =>
          p.profile.origin.trim() !== "" && p.profile.destination.trim() !== "",
      },
      {
        value: "sentido",
        label: "Sentido",
        icon: ArrowLeftRight,
        title: "Ida o vuelta",
        body: (
          <p>
            La misma calle se camina distinto en cada sentido: los giros se
            invierten y los cruces quedan del otro lado. Por eso la ida y la
            vuelta son dos perfiles, cada uno con sus puntos.
          </p>
        ),
        done: (p) => p.seen.has("sentido") || hasPoints(p),
      },
      {
        value: "identificador",
        label: "Identificador",
        icon: Hash,
        title: "Identificador",
        body: (
          <p>
            Se arma solo a partir del nombre: minúsculas, números y guiones.
            Después de guardar ya no cambia, porque con otro identificador sería
            una ruta distinta.
          </p>
        ),
        done: (p) => p.slug !== "",
      },
    ],
  },
  {
    label: "Notas de campo",
    topics: [
      {
        value: "telefono",
        label: "Teléfono",
        icon: Smartphone,
        title: "Por qué el mapa cambia con el teléfono",
        body: (
          <>
            <p>
              Cada teléfono sube sus propias notas y su propio recorrido GPS. Al
              elegir uno, el mapa muestra solo lo que caminó ese teléfono y se
              centra ahí.
            </p>
            <p>
              Por eso se ve distinto con cada teléfono, o vacío si ese teléfono
              no salió. Elige el que hizo la caminata de esta ruta.
            </p>
          </>
        ),
        done: (p) => p.deviceId !== undefined,
      },
      {
        value: "dia",
        label: "Día",
        icon: CalendarDays,
        title: "Día de la caminata",
        body: (
          <p>
            Cada jornada queda aparte. Se abre el último día con recorrido; si
            hubo varias, elige la de esta ruta. La lista muestra solo las notas
            de ese día.
          </p>
        ),
        done: (p) => p.day !== undefined,
      },
      {
        value: "gps",
        label: "Recorrido GPS",
        icon: Route,
        title: "La línea del recorrido",
        legend: "track",
        body: (
          <>
            <p>
              La línea punteada es por donde pasó el teléfono. Sirve para ver
              por dónde se camina de verdad.
            </p>
            <p>
              Las rectas largas que atraviesan edificios no son camino: unen dos
              lecturas cuando el GPS se perdió, bajo techo o entre edificios. No
              pongas puntos sobre ellas.
            </p>
          </>
        ),
        done: (p) => p.seen.has("gps"),
      },
      {
        value: "notas",
        label: "Notas dictadas",
        icon: MessageSquareText,
        title: "Lo que dictó la persona",
        legend: "notes",
        body: (
          <>
            <p>
              Cada círculo es algo que la persona dictó caminando («anota que
              …»), con la hora y la precisión del GPS (±m).
            </p>
            <p>
              Toca una nota para insertarla como punto o, si tienes un punto
              abierto, para mover ese punto adonde se dictó. Con ±15 m o más,
              confirma el lugar en el mapa.
            </p>
          </>
        ),
        done: (p) => p.seen.has("notas") || hasPoints(p),
      },
    ],
  },
  {
    label: "Puntos",
    topics: [
      {
        value: "agregar",
        label: "Agregar puntos",
        icon: MapPinPlus,
        title: "Qué es un punto y cómo se agrega",
        legend: "pins",
        body: (
          <>
            <p>
              Un punto es un lugar donde la app avisa algo: un giro, un cruce,
              una referencia. Se recorren en orden, del 1 al último.
            </p>
            <p>
              Agrégalos insertando una nota de campo, con «Agregar en el mapa» o
              con «Punto después». En el mapa se arrastran para corregirlos. Una
              ruta lleva de 2 a 60.
            </p>
          </>
        ),
        done: (p) => hasPoints(p),
      },
      {
        value: "indicacion",
        label: "Nombre e indicación",
        icon: MessageSquareText,
        title: "Lo que dice la app en cada punto",
        body: (
          <>
            <p>
              Al acercarse, la app nombra el punto y dice a cuántos pasos está.
              Al llegar, lee la indicación y adelanta el siguiente.
            </p>
            <p>
              El nombre es una referencia que la persona reconoce («Letrero de
              la estación»). La indicación dice qué hacer ahí («Gira a la
              izquierda; a unos 8 pasos está el cruce»).
            </p>
          </>
        ),
        done: (p) => p.profile.points.some((pt) => pt.instruction.trim()),
      },
      {
        value: "cruce",
        label: "Riesgo y cruce",
        icon: TrafficCone,
        title: "Riesgo y cruce de vía",
        legend: "pins",
        body: (
          <>
            <p>
              Si en el punto se cruza una calle, marca cómo: semáforo, cebra o
              sin control. Un cruce sube el riesgo a alto.
            </p>
            <p>
              La app anuncia los cruces y los puntos de riesgo alto desde el
              punto anterior, para que no lleguen de sorpresa. En el mapa, el
              riesgo medio se ve ámbar y el alto, rojo.
            </p>
          </>
        ),
        done: (p) => p.seen.has("cruce"),
      },
      {
        value: "distancias",
        label: "Aviso y llegada",
        icon: Radar,
        title: "Aviso al acercarse y llegada",
        body: (
          <>
            <p>
              <strong className="font-medium text-foreground">Aviso</strong>: a
              esa distancia la app anuncia el punto.{" "}
              <strong className="font-medium text-foreground">Llegada</strong>:
              a esa distancia lo da por alcanzado y lee la indicación.
            </p>
            <p>
              La llegada siempre es menor que el aviso. Si el GPS está peor que
              la llegada, la app usa la precisión del GPS. Por omisión, 12 m y 5
              m.
            </p>
          </>
        ),
        done: (p) => p.seen.has("distancias"),
      },
      {
        value: "pasos",
        label: "Pasos",
        icon: Footprints,
        title: "Distancia en pasos",
        legend: "segment",
        body: (
          <p>
            Entre dos puntos se ve la distancia en pasos, como la dice la app
            (unos 0,75 m por paso). Si quedan a menos de 8 m, el tramo se pone
            ámbar: el GPS del teléfono no los distingue. Únelos o sepáralos.
          </p>
        ),
        done: (p) => hasPoints(p, 2),
      },
    ],
  },
  {
    label: "Guardar",
    topics: [
      {
        value: "revisar",
        label: "Revisar avisos",
        icon: TriangleAlert,
        title: "Avisos por revisar",
        body: (
          <p>
            Arriba se cuentan los avisos. No impiden guardar, pero cada uno es
            algo que ya falló en campo: un giro que la indicación no dice o dos
            puntos encimados. Ábrelos desde la lista.
          </p>
        ),
        done: (p) => hasPoints(p, 2) && p.warnings === 0,
      },
      {
        value: "guardar",
        label: "Guardar",
        icon: Save,
        title: "Guardar la ruta",
        body: (
          <p>
            Antes de enviar se revisa todo. Si falta algo, te lleva al campo o
            al punto exacto. «.json» descarga una copia del perfil.
          </p>
        ),
        done: (p) => !p.isNew && !p.dirty,
      },
      {
        value: "validar",
        label: "De prueba a Validada",
        icon: BadgeCheck,
        title: "De prueba a Validada",
        body: (
          <p>
            Toda ruta nueva queda «De prueba» y la app se lo advierte a la
            persona. Se marca «Validada» desde la lista de rutas de la consola,
            después de caminarla completa con la persona y comprobar que los
            avisos llegan a tiempo.
          </p>
        ),
        done: (p) => p.seen.has("validar") || p.profile.validated_in_field,
      },
    ],
  },
]

const TOPICS = GUIDE.flatMap((s) => s.topics)

/** Sección de un tema. */
export function sectionOf(value: string) {
  return GUIDE.findIndex((s) => s.topics.some((t) => t.value === value))
}

/** El primer tema sin hacer después de `from` (o desde el principio). */
export function nextPending(p: GuideProgress, from?: string) {
  const start = from ? TOPICS.findIndex((t) => t.value === from) + 1 : 0
  const ordered = [...TOPICS.slice(start), ...TOPICS.slice(0, start)]
  return ordered.find((t) => t.value !== from && !t.done(p))?.value
}

function LegendRow({ legend }: { legend: Legend }) {
  const row = "flex items-center gap-2.5 text-xs text-muted-foreground"
  switch (legend) {
    case "track":
      return (
        <div className={row}>
          <svg width="40" height="8" aria-hidden="true">
            <line
              x1="2"
              y1="4"
              x2="38"
              y2="4"
              className="stroke-muted-foreground"
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeDasharray="2 5"
              strokeLinecap="round"
            />
          </svg>
          Recorrido GPS del día
          <svg width="40" height="8" aria-hidden="true" className="ml-2">
            <line
              x1="2"
              y1="4"
              x2="38"
              y2="4"
              className="stroke-foreground"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          La ruta
        </div>
      )
    case "notes":
      return (
        <div className={row}>
          <span
            aria-hidden="true"
            className="size-3 rounded-full border-2 border-wait bg-wait/35"
          />
          Nota de campo
          <span
            aria-hidden="true"
            className="ml-2 size-4 rounded-full border-2 border-wait bg-wait/80"
          />
          Nota elegida
        </div>
      )
    case "pins":
      return (
        <div className={cn(row, "flex-wrap")}>
          {(
            [
              ["plain", "Normal"],
              ["caution", "Riesgo medio"],
              ["danger", "Alto o cruce"],
            ] as const
          ).map(([tone, label], i) => (
            <span key={tone} className="inline-flex items-center gap-1.5">
              <span className="inline-block size-5" aria-hidden="true">
                <span className="route-pin cursor-default" data-tone={tone}>
                  {i + 1}
                </span>
              </span>
              {label}
            </span>
          ))}
        </div>
      )
    case "segment":
      return (
        <div className={cn(row, "flex-wrap gap-x-4")}>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-4 w-0.5 rounded-full bg-border"
            />
            <span className="font-mono tabular-nums">≈ 25 pasos · 19 m</span>
          </span>
          <span className="inline-flex items-center gap-2 text-wait">
            <span
              aria-hidden="true"
              className="h-4 w-0.5 rounded-full bg-wait"
            />
            <span className="font-mono tabular-nums">≈ 5 pasos · 4 m</span>
          </span>
        </div>
      )
  }
}

/**
 * Guía del editor de rutas: un menú ramificado con cada paso y cada campo, que
 * sigue lo que hace la persona (el campo que enfoca, lo que ya llenó) y explica
 * qué es y cómo lo usa la app.
 */
export function RouteGuide({
  progress,
  active,
  onActive,
  onShow,
  onClose,
  className,
}: {
  progress: GuideProgress
  active: string
  onActive: (value: string) => void
  /** Lleva al campo del tema en el editor. */
  onShow: (value: string) => void
  onClose: () => void
  className?: string
}) {
  const [open, setOpen] = useState<number[]>(() => [sectionOf(active)])

  // Al pasar a otra sección, la guía abre esa y pliega las demás.
  const activeSection = sectionOf(active)
  const [lastSection, setLastSection] = useState(activeSection)
  if (activeSection !== lastSection) {
    setLastSection(activeSection)
    setOpen([activeSection])
  }

  const doneCount = TOPICS.filter((t) => t.done(progress)).length
  const topic = TOPICS.find((t) => t.value === active) ?? TOPICS[0]
  const isDone = topic.done(progress)
  const next = nextPending(progress, topic.value)
  const nextTopic = TOPICS.find((t) => t.value === next)

  const items = useMemo<BranchedMenuItem[]>(
    () =>
      GUIDE.map((section) => ({
        label: section.label,
        meta: `${section.topics.filter((t) => t.done(progress)).length}/${section.topics.length}`,
        children: section.topics.map((t) => {
          const Icon = t.done(progress) ? Check : t.icon
          return {
            value: t.value,
            label: t.label,
            icon: (
              <Icon
                className={cn(
                  "size-4",
                  t.done(progress) && t.value !== active && "text-signal"
                )}
                strokeWidth={1.8}
              />
            ),
          }
        }),
      })),
    [progress, active]
  )

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Guía del editor de rutas"
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border bg-popover/95 text-popover-foreground shadow-[0_24px_48px_-24px_oklch(0.2_0.04_260/45%)] backdrop-blur",
          className
        )}
      >
        <header className="flex items-center gap-3 border-b px-4 py-2.5">
          <span className="text-sm font-semibold">Guía de la ruta</span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div
              role="progressbar"
              aria-label="Avance de la guía"
              aria-valuemin={0}
              aria-valuemax={TOPICS.length}
              aria-valuenow={doneCount}
              className="h-1 max-w-40 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${(doneCount / TOPICS.length) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {doneCount}/{TOPICS.length}
            </span>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Cerrar la guía"
            onClick={onClose}
          >
            <X />
          </Button>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[232px_minmax(0,1fr)]">
          <div className="min-h-0 overflow-y-auto border-b px-3 py-2 sm:border-r sm:border-b-0">
            <BranchedMenu
              aria-label="Pasos de la guía"
              items={items}
              open={open}
              onToggle={(i, isOpen) =>
                setOpen((prev) =>
                  isOpen ? [...prev, i] : prev.filter((s) => s !== i)
                )
              }
              active={active}
              onSelect={(value) => onActive(value)}
              width={208}
              rowHeight={32}
              indent={30}
              trunk={10}
              radius={8}
              fontSize={13}
              color="var(--foreground)"
              accentColor="var(--signal)"
              lineColor="var(--border)"
            />
          </div>
          <div className="min-h-0 overflow-y-auto px-4 py-3.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={topic.value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                aria-live="polite"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg",
                      isDone
                        ? "bg-signal-soft text-signal"
                        : "bg-muted text-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {isDone ? (
                      <Check className="size-4" />
                    ) : (
                      <topic.icon className="size-4" strokeWidth={1.8} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm leading-tight font-semibold text-balance">
                      {topic.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {GUIDE[sectionOf(topic.value)].label}
                      {isDone && " · listo"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                  {topic.body}
                </div>
                {topic.legend && (
                  <div className="mt-3 rounded-lg bg-muted/60 px-3 py-2.5">
                    <LegendRow legend={topic.legend} />
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShow(topic.value)}
                  >
                    <Crosshair /> Mostrar dónde
                  </Button>
                  {nextTopic && (
                    <Button
                      size="sm"
                      variant={isDone ? "default" : "ghost"}
                      onClick={() => {
                        onActive(nextTopic.value)
                        onShow(nextTopic.value)
                      }}
                    >
                      {nextTopic.label} <ArrowRight />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

/** Recuerda si la persona cerró la guía, para no abrirla sola otra vez. */
const GUIDE_CLOSED_KEY = "lazarus.routeGuide.closed"

export function guideWasClosed() {
  try {
    return localStorage.getItem(GUIDE_CLOSED_KEY) === "1"
  } catch {
    return false
  }
}

export function rememberGuideClosed() {
  try {
    localStorage.setItem(GUIDE_CLOSED_KEY, "1")
  } catch {
    // Sin almacenamiento, la guía solo vuelve a abrirse sola.
  }
}

/** Marca en el editor el campo del tema activo. */
export function useGuideHighlight(active: string | null, revision: string) {
  useEffect(() => {
    if (!active) return
    const el = document.querySelector<HTMLElement>(`[data-guide="${active}"]`)
    if (!el) return
    el.setAttribute("data-guide-active", "")
    return () => el.removeAttribute("data-guide-active")
  }, [active, revision])
}
