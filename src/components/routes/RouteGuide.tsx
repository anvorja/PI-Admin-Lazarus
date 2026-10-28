import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Crosshair,
  Flag,
  Footprints,
  Hash,
  ListTree,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
interface GuideProps {
  progress: GuideProgress
  active: string
  onActive: (value: string) => void
  /** Lleva al campo del tema en el editor. */
  onShow: (value: string) => void
  onClose: () => void
  /** En el teléfono: una barra fija y la explicación en una hoja inferior. */
  mobile?: boolean
  className?: string
}

/**
 * Guía del editor de rutas. Va en la columna del formulario, junto a los campos
 * que explica, y nunca sobre el mapa. Muestra el tema del campo que la persona
 * enfoca; «Pasos» abre el menú ramificado con todo el recorrido de la guía.
 * En pantalla ancha se pliega a una línea; en el teléfono es una barra fija
 * que abre la explicación en una hoja desde abajo.
 */
export function RouteGuide(props: GuideProps) {
  const { progress, active, onClose, mobile, className } = props
  const [folded, setFolded] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  const doneCount = TOPICS.filter((t) => t.done(progress)).length
  const topic = TOPICS.find((t) => t.value === active) ?? TOPICS[0]
  const bodyId = "guia-ruta-contenido"

  const body = (
    <GuideBody
      {...props}
      showSteps={showSteps}
      onShowSteps={setShowSteps}
      // En el teléfono la hoja se cierra para dejar ver el campo.
      beforeShow={mobile ? () => setSheetOpen(false) : undefined}
    />
  )

  if (mobile) {
    const openSheet = (steps: boolean) => {
      setShowSteps(steps)
      setSheetOpen(true)
    }
    return (
      <MotionConfig reducedMotion="user">
        <section
          aria-label="Guía del editor de rutas"
          className={cn(
            "flex items-center gap-1 rounded-lg border bg-card py-1.5 pr-1.5 pl-3 shadow-[0_12px_32px_-20px_oklch(0.2_0.04_260/35%)]",
            className
          )}
        >
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => openSheet(false)}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <ProgressRing done={doneCount} total={TOPICS.length} />
            <span className="min-w-0">
              <span className="block text-sm leading-tight font-semibold">
                Guía de la ruta
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {topic.title}
              </span>
            </span>
          </button>
          <Button
            size="sm"
            variant="ghost"
            aria-haspopup="dialog"
            onClick={() => openSheet(true)}
          >
            <ListTree /> Pasos
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Cerrar la guía"
            onClick={onClose}
          >
            <X />
          </Button>
        </section>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[85dvh] gap-0 rounded-t-xl pb-[env(safe-area-inset-bottom)]"
            // El foco va al campo que se muestra, no de vuelta a la barra.
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <SheetHeader className="flex-row items-center gap-2.5 border-b px-4 py-3 pr-12">
              <ProgressRing done={doneCount} total={TOPICS.length} />
              <div className="min-w-0">
                <SheetTitle className="text-sm">Guía de la ruta</SheetTitle>
                <SheetDescription className="text-xs">
                  {doneCount} de {TOPICS.length} listos
                </SheetDescription>
              </div>
              <Button
                size="sm"
                variant={showSteps ? "secondary" : "ghost"}
                aria-pressed={showSteps}
                className="ml-auto"
                onClick={() => setShowSteps(!showSteps)}
              >
                <ListTree /> Pasos
              </Button>
            </SheetHeader>
            <div className="min-h-0 overflow-y-auto px-4 pt-3 pb-5">{body}</div>
          </SheetContent>
        </Sheet>
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Guía del editor de rutas"
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border bg-card shadow-[0_12px_32px_-20px_oklch(0.2_0.04_260/35%)]",
          className
        )}
      >
        <header className="flex items-center gap-2 py-1.5 pr-1.5 pl-3">
          <button
            type="button"
            aria-expanded={!folded}
            aria-controls={bodyId}
            onClick={() => setFolded(!folded)}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <ProgressRing done={doneCount} total={TOPICS.length} />
            <span className="min-w-0">
              <span className="block text-sm leading-tight font-semibold">
                Guía de la ruta
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {folded
                  ? topic.title
                  : `${doneCount} de ${TOPICS.length} listos`}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                !folded && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
          {!folded && (
            <Button
              size="sm"
              variant={showSteps ? "secondary" : "ghost"}
              aria-pressed={showSteps}
              onClick={() => setShowSteps(!showSteps)}
            >
              <ListTree /> Pasos
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Cerrar la guía"
            onClick={onClose}
          >
            <X />
          </Button>
        </header>
        {!folded && (
          <div
            id={bodyId}
            className="min-h-0 overflow-y-auto border-t px-4 pt-3 pb-4"
          >
            {body}
          </div>
        )}
      </section>
    </MotionConfig>
  )
}

/** El tema activo con su explicación, o el menú ramificado con todos. */
function GuideBody({
  progress,
  active,
  onActive,
  onShow,
  showSteps,
  onShowSteps,
  beforeShow,
}: GuideProps & {
  showSteps: boolean
  onShowSteps: (show: boolean) => void
  beforeShow?: () => void
}) {
  const [open, setOpen] = useState<number[]>(() => [sectionOf(active)])

  // Al pasar a otra sección, el menú abre esa y pliega las demás.
  const activeSection = sectionOf(active)
  const [lastSection, setLastSection] = useState(activeSection)
  if (activeSection !== lastSection) {
    setLastSection(activeSection)
    setOpen([activeSection])
  }

  const topic = TOPICS.find((t) => t.value === active) ?? TOPICS[0]
  const isDone = topic.done(progress)
  const next = nextPending(progress, topic.value)
  const nextTopic = TOPICS.find((t) => t.value === next)

  const show = (value: string) => {
    if (!beforeShow) return onShow(value)
    // La hoja bloquea el desplazamiento y el foco hasta que termina de cerrarse.
    beforeShow()
    window.setTimeout(() => onShow(value), 260)
  }

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
    <AnimatePresence mode="wait" initial={false}>
      {showSteps ? (
        <motion.div
          key="pasos"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
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
            onSelect={(value) => {
              onActive(value)
              // Deja ver la rama que se dibuja antes de volver al tema.
              window.setTimeout(() => onShowSteps(false), 320)
            }}
            width={400}
            rowHeight={36}
            indent={30}
            trunk={10}
            radius={8}
            fontSize={13}
            color="var(--foreground)"
            accentColor="var(--signal)"
            lineColor="var(--border)"
          />
        </motion.div>
      ) : (
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
              onClick={() => show(topic.value)}
            >
              <Crosshair /> Mostrar dónde
            </Button>
            {nextTopic && (
              <Button
                size="sm"
                variant={isDone ? "default" : "ghost"}
                onClick={() => {
                  onActive(nextTopic.value)
                  show(nextTopic.value)
                }}
              >
                {nextTopic.label} <ArrowRight />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Avance de la guía en un anillo pequeño. */
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 9
  const length = 2 * Math.PI * r
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      role="img"
      aria-label={`${done} de ${total} temas listos`}
      className="shrink-0 -rotate-90"
    >
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        strokeWidth="2.5"
        className="stroke-muted"
      />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-signal transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - done / total)}
      />
    </svg>
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
