import {
  getRouteApi,
  Link,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router"
import {
  ArrowLeft,
  ChevronDown,
  FileDown,
  MapPin,
  Redo2,
  Save,
  Undo2,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { AppHeader } from "@/components/console/AppHeader"
import {
  FieldNotesPanel,
  hasPosition,
} from "@/components/routes/FieldNotesPanel"
import { RouteMap, type PositionedNote } from "@/components/routes/RouteMap"
import { StepList, pointWarnings } from "@/components/routes/StepList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDevices } from "@/hooks/useDevices"
import { useDeviceNotes, useDeviceTrack } from "@/hooks/useFieldData"
import {
  bestInsertIndex,
  newPoint,
  useRouteDraft,
  type RouteDraft,
} from "@/hooks/useRouteDraft"
import { useRoutes, useSaveRoute } from "@/hooks/useRoutes"
import { routeProfileSchema, type RouteProfile } from "@/lib/api/schemas"
import { distanceM } from "@/lib/geo"
import { downloadProfile } from "@/lib/routeFiles"
import { cn } from "@/lib/utils"

const route = getRouteApi("/rutas/$slug")

/** Slug para un perfil nuevo, a partir de su nombre. */
function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

const EMPTY: RouteProfile = {
  slug: "",
  name: "",
  origin: "",
  destination: "",
  direction: "outbound",
  family: "other",
  validated_in_field: false,
  points: [],
}

/** Editor de un perfil de ruta: `/rutas/<slug>`, o `/rutas/nueva`. */
export function RouteEditorPage() {
  const { slug } = route.useParams()
  const routes = useRoutes()
  const isNew = slug === "nueva"
  const original = routes.data?.find((r) => r.slug === slug)

  return (
    <div className="min-h-dvh">
      <AppHeader />
      {isNew ? (
        <Editor key="nueva" initial={EMPTY} isNew />
      ) : routes.isPending ? (
        <div className="mx-auto max-w-[1400px] space-y-4 px-4 py-8 lg:px-8">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-[60dvh] w-full" />
        </div>
      ) : !original ? (
        <main className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
          <p className="text-sm text-muted-foreground">
            {routes.error
              ? `No se pudieron cargar las rutas: ${routes.error.message}`
              : `No hay una ruta "${slug}".`}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">
              <ArrowLeft /> Volver a la consola
            </Link>
          </Button>
        </main>
      ) : (
        <Editor key={slug} initial={original} isNew={false} />
      )}
    </div>
  )
}

type Tab = "recorrido" | "notas"

function Editor({ initial, isNew }: { initial: RouteProfile; isNew: boolean }) {
  const draft = useRouteDraft(initial)
  const profile = draft.draft
  const save = useSaveRoute()
  const navigate = useNavigate()
  const devices = useDevices()

  const [tab, setTab] = useState<Tab>(isNew ? "notas" : "recorrido")
  const [selected, setSelected] = useState<number | null>(null)
  const [placingAfter, setPlacingAfter] = useState<number | null>(null)
  const [metaOpen, setMetaOpen] = useState(isNew)
  const [slugEdited, setSlugEdited] = useState(false)

  const [deviceId, setDeviceId] = useState<number | undefined>()
  const [day, setDay] = useState<string | undefined>()
  const [showTrack, setShowTrack] = useState(true)
  const [focusedNote, setFocusedNote] = useState<PositionedNote | null>(null)
  const notes = useDeviceNotes(deviceId)
  const track = useDeviceTrack(deviceId, day)
  const activeDay = day ?? track.data?.day ?? undefined
  const dayNotes = useMemo(
    () =>
      (notes.data ?? []).filter(
        (n) => !activeDay || n.at.startsWith(activeDay)
      ),
    [notes.data, activeDay]
  )
  const mapNotes = useMemo(() => dayNotes.filter(hasPosition), [dayNotes])

  // Atajos de deshacer y rehacer fuera de los campos de texto.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.closest("input, textarea, select")) return
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z")
        return
      event.preventDefault()
      if (event.shiftKey) draft.redo()
      else draft.undo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [draft])

  useBlocker({
    shouldBlockFn: () =>
      draft.dirty &&
      !window.confirm(
        "Hay cambios sin guardar en la ruta. ¿Salir sin guardar?"
      ),
    enableBeforeUnload: () => draft.dirty,
  })

  const warnings = profile.points.reduce(
    (count, _, i) => count + pointWarnings(profile.points, i).length,
    0
  )

  function place(lat: number, lon: number) {
    if (placingAfter === null) return
    const at = placingAfter + 1
    draft.insertPoint(at, newPoint(lat, lon))
    setPlacingAfter(null)
    setSelected(at)
    setTab("recorrido")
  }

  function noteAction(note: PositionedNote, action: "insert" | "move") {
    if (action === "move" && selected !== null) {
      draft.updatePoint(selected, {
        lat: Number(note.lat.toFixed(6)),
        lon: Number(note.lon.toFixed(6)),
      })
      toast.success(
        `Punto ${selected + 1} movido a la nota de las ${note.at.slice(11, 16)}`
      )
      return
    }
    const at = bestInsertIndex(profile.points, note, distanceM)
    const name =
      note.text.length > 60 ? `${note.text.slice(0, 57)}…` : note.text
    draft.insertPoint(at, {
      ...newPoint(note.lat, note.lon, name),
      instruction: note.text.slice(0, 200),
    })
    setSelected(at)
    toast.success(
      `Nota insertada como punto ${at + 1}. Ajusta el nombre y la indicación.`
    )
  }

  async function submit() {
    const candidate =
      isNew && !slugEdited
        ? { ...profile, slug: slugify(profile.name) }
        : profile
    const result = routeProfileSchema.safeParse(candidate)
    if (!result.success) {
      const issue = result.error.issues[0]
      const [first, index, field] = issue.path
      const where =
        first === "points" && typeof index === "number"
          ? `Punto ${index + 1}${field ? ` (${String(field)})` : ""}: `
          : issue.path.length
            ? `${issue.path.join(".")}: `
            : ""
      toast.error(`${where}${issue.message}`)
      if (first === "points" && typeof index === "number") setSelected(index)
      else setMetaOpen(true)
      return
    }
    try {
      const saved = await save.mutateAsync(result.data)
      draft.markSaved(saved)
      toast.success(`Guardada: ${saved.name} (${saved.points.length} puntos)`)
      if (isNew) {
        void navigate({ to: "/rutas/$slug", params: { slug: saved.slug } })
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Volver a la consola"
        >
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {profile.name || "Ruta nueva"}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
            {profile.points.length} puntos
            {warnings > 0 && (
              <span className="text-wait">
                {" "}
                · {warnings} {warnings === 1 ? "aviso" : "avisos"} por revisar
              </span>
            )}
            {draft.dirty && (
              <span className="text-foreground"> · sin guardar</span>
            )}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
            profile.validated_in_field
              ? "bg-signal-soft text-signal"
              : "bg-wait-soft text-wait"
          )}
        >
          {profile.validated_in_field ? "Validada" : "De prueba"}
        </span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Deshacer"
                disabled={!draft.canUndo}
                onClick={draft.undo}
              >
                <Undo2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Rehacer"
                disabled={!draft.canRedo}
                onClick={draft.redo}
              >
                <Redo2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rehacer (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            disabled={profile.points.length === 0}
            onClick={() => downloadProfile(profile)}
          >
            <FileDown /> .json
          </Button>
          <Button
            disabled={!draft.dirty || save.isPending}
            onClick={() => void submit()}
          >
            <Save /> {save.isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start">
        <section
          aria-label="Mapa"
          className="relative order-1 h-[55dvh] overflow-hidden rounded-lg border lg:sticky lg:top-24 lg:order-2 lg:h-[calc(100dvh-8.5rem)]"
        >
          <RouteMap
            points={profile.points}
            selected={selected}
            onSelect={(i) => {
              setSelected(i)
              setTab("recorrido")
            }}
            onMove={(i, lat, lon) =>
              draft.updatePoint(i, {
                lat: Number(lat.toFixed(6)),
                lon: Number(lon.toFixed(6)),
              })
            }
            placing={placingAfter !== null}
            onPlace={place}
            notes={mapNotes}
            focusedNote={focusedNote}
            onNoteAction={noteAction}
            track={showTrack ? (track.data?.points ?? []) : []}
          />
          {placingAfter !== null && (
            <div className="absolute inset-x-3 top-3 z-[500] flex items-center justify-between gap-3 rounded-lg border bg-popover/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
              <span className="flex items-center gap-2">
                <MapPin
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Toca el mapa donde va el punto {placingAfter + 2}.
              </span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Cancelar"
                onClick={() => setPlacingAfter(null)}
              >
                <X />
              </Button>
            </div>
          )}
        </section>

        <aside className="order-2 min-w-0 lg:order-1">
          <MetaForm
            draft={draft}
            isNew={isNew}
            open={metaOpen}
            onOpen={setMetaOpen}
            slugEdited={slugEdited}
            onSlugEdited={() => setSlugEdited(true)}
          />
          <div
            role="tablist"
            aria-label="Vista"
            className="mt-5 flex gap-1 rounded-full border p-1"
          >
            {(
              [
                ["recorrido", "Recorrido"],
                [
                  "notas",
                  `Notas de campo${dayNotes.length ? ` (${dayNotes.length})` : ""}`,
                ],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "h-8 flex-1 rounded-full text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  tab === value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4" role="tabpanel">
            {tab === "recorrido" ? (
              <StepList
                draft={draft}
                selected={selected}
                onSelect={setSelected}
                onPlaceAfter={setPlacingAfter}
              />
            ) : (
              <FieldNotesPanel
                devices={devices.data ?? []}
                deviceId={deviceId}
                onDevice={(id) => {
                  setDeviceId(id)
                  setDay(undefined)
                  setFocusedNote(null)
                }}
                track={track.data}
                day={activeDay}
                onDay={setDay}
                showTrack={showTrack}
                onShowTrack={setShowTrack}
                notes={dayNotes}
                loading={notes.isPending}
                error={notes.error}
                focused={focusedNote}
                onFocus={setFocusedNote}
                selected={selected}
                onAction={noteAction}
              />
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}

function MetaForm({
  draft,
  isNew,
  open,
  onOpen,
  slugEdited,
  onSlugEdited,
}: {
  draft: RouteDraft
  isNew: boolean
  open: boolean
  onOpen: (open: boolean) => void
  slugEdited: boolean
  onSlugEdited: () => void
}) {
  const p = draft.draft
  const field = (key: "name" | "origin" | "destination") => ({
    value: p[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      draft.setMeta({ [key]: e.target.value }, `meta:${key}`),
  })
  const slug = isNew && !slugEdited ? slugify(p.name) : p.slug

  return (
    <div className="rounded-lg border bg-card/70">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpen(!open)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="min-w-0">
          Datos del perfil
          {!open && (
            <span className="ml-2 font-normal text-muted-foreground">
              {p.direction === "outbound" ? "Ida" : "Vuelta"} ·{" "}
              {p.origin || "origen"} → {p.destination || "destino"}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="space-y-3 border-t px-4 pt-3 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="ruta-nombre">Nombre</Label>
            <Input id="ruta-nombre" maxLength={120} {...field("name")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ruta-origen">Origen</Label>
              <Input id="ruta-origen" maxLength={80} {...field("origin")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ruta-destino">Destino</Label>
              <Input
                id="ruta-destino"
                maxLength={80}
                {...field("destination")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ruta-sentido">Sentido</Label>
              <select
                id="ruta-sentido"
                value={p.direction}
                onChange={(e) =>
                  draft.setMeta({
                    direction: e.target.value as RouteProfile["direction"],
                  })
                }
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="outbound">Ida</option>
                <option value="return">Vuelta</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ruta-slug">Identificador</Label>
              <Input
                id="ruta-slug"
                value={slug}
                readOnly={!isNew}
                maxLength={60}
                className="font-mono text-xs"
                onChange={(e) => {
                  onSlugEdited()
                  draft.setMeta({ slug: e.target.value }, "meta:slug")
                }}
              />
            </div>
          </div>
          {!isNew && (
            <p className="text-xs text-muted-foreground">
              El identificador no cambia: con otro, se guardaría como una ruta
              distinta.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
