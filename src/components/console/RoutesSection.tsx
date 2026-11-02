import { Link } from "@tanstack/react-router"
import {
  BadgeCheck,
  CircleOff,
  FileDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Route,
  Trash2,
  Upload,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteRoute, useRoutes, useSaveRoute } from "@/hooks/useRoutes"
import { routeProfileSchema, type RouteProfile } from "@/lib/api/schemas"
import { downloadProfile } from "@/lib/routeFiles"
import { cn } from "@/lib/utils"

const DIRECTION_LABEL = { outbound: "Ida", return: "Vuelta" } as const

/** Lee un .json y lo valida con el contrato del backend; el error dice dónde. */
async function readProfile(file: File): Promise<RouteProfile> {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error(`${file.name}: no es un JSON válido`)
  }
  const result = routeProfileSchema.safeParse(data)
  if (!result.success) {
    const issue = result.error.issues[0]
    const where = issue.path.join(".")
    throw new Error(
      `${file.name}: ${where ? `${where}: ` : ""}${issue.message}`
    )
  }
  return result.data
}

const isJson = (file: File) =>
  file.type === "application/json" || file.name.toLowerCase().endsWith(".json")

/** Solo reaccionan al arrastre de archivos, no al de texto o enlaces. */
const hasFiles = (event: React.DragEvent) =>
  event.dataTransfer.types.includes("Files")

/** Perfiles de ruta curados (HU-022): se cargan desde un .json, con el botón o
 * arrastrándolo a la sección, y se guardan en el servidor. */
export function RoutesSection() {
  const routes = useRoutes()
  const save = useSaveRoute()
  const input = useRef<HTMLInputElement>(null)
  // dragenter y dragleave llegan también de los hijos: se cuentan para saber
  // cuándo el archivo salió de verdad de la sección.
  const depth = useRef(0)
  const [dragging, setDragging] = useState(false)

  async function upload(files: FileList | File[] | null) {
    for (const file of Array.from(files ?? [])) {
      if (!isJson(file)) {
        toast.error(`${file.name}: solo se cargan archivos .json`)
        continue
      }
      try {
        const profile = await readProfile(file)
        const replaced = routes.data?.some((r) => r.slug === profile.slug)
        await save.mutateAsync(profile)
        toast.success(
          `${replaced ? "Reemplazado" : "Cargado"}: ${profile.name} (${profile.points.length} puntos)`
        )
      } catch (error) {
        toast.error((error as Error).message)
      }
    }
    if (input.current) input.current.value = ""
  }

  return (
    <div
      className="relative"
      onDragEnter={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        depth.current += 1
        setDragging(true)
      }}
      onDragOver={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = save.isPending ? "none" : "copy"
      }}
      onDragLeave={(event) => {
        if (!hasFiles(event)) return
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) setDragging(false)
      }}
      onDrop={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        depth.current = 0
        setDragging(false)
        if (!save.isPending) void upload(event.dataTransfer.files)
      }}
    >
      {dragging && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 z-10 grid place-items-center rounded-lg border-2 border-dashed border-signal/70 bg-card/90 sm:-inset-4"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Upload className="size-4 text-signal" />
            Suelta los .json para cargarlos
          </span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Route className="size-5 shrink-0 text-muted-foreground" />
          <h2 className="text-base font-medium">Rutas curadas</h2>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="outline" size="sm" asChild>
            <Link to="/rutas/$slug" params={{ slug: "nueva" }}>
              <Plus /> Nueva
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={save.isPending}
            onClick={() => input.current?.click()}
          >
            <Upload /> Cargar
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          multiple
          hidden
          onChange={(event) => void upload(event.target.files)}
        />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Perfiles con los que la app guía punto por punto. Cárgalos con el botón
        o arrastra los .json a esta sección.
      </p>

      <div className="mt-5">
        {routes.isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : routes.error ? (
          <p className="text-sm text-destructive" role="alert">
            No se pudieron cargar las rutas: {routes.error.message}
          </p>
        ) : routes.data.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Aún no hay rutas. Carga o arrastra aquí el .json de la ida y el de
            la vuelta: son perfiles distintos.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {routes.data.map((route) => (
              <RouteRow key={route.slug} route={route} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

type Dialog = "validate" | "delete" | null

function RouteRow({ route }: { route: RouteProfile }) {
  const save = useSaveRoute()
  const remove = useDeleteRoute()
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = (open: boolean) => {
    if (!open) setDialog(null)
  }

  const setValidated = (validated_in_field: boolean) =>
    save.mutate(
      { ...route, validated_in_field },
      {
        onSuccess: () =>
          toast.success(
            validated_in_field
              ? `${route.name}: validada en campo`
              : `${route.name}: vuelve a ser de prueba`
          ),
        onError: (error) => toast.error(error.message),
      }
    )

  return (
    <li className="flex items-start gap-2 py-3 pr-2 pl-4">
      <div className="min-w-0 flex-1">
        <Link
          to="/rutas/$slug"
          params={{ slug: route.slug }}
          className="line-clamp-2 rounded-sm text-sm leading-snug font-medium hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          title={`Editar ${route.name}`}
        >
          {route.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap",
              route.validated_in_field
                ? "bg-signal-soft text-signal"
                : "bg-wait-soft text-wait"
            )}
          >
            {route.validated_in_field ? "Validada" : "De prueba"}
          </span>
          <span
            className="font-mono text-xs text-muted-foreground tabular-nums"
            title={route.slug}
          >
            {DIRECTION_LABEL[route.direction]} · {route.points.length} puntos
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Más acciones para ${route.name}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem asChild>
            <Link to="/rutas/$slug" params={{ slug: route.slug }}>
              <Pencil /> Editar puntos
            </Link>
          </DropdownMenuItem>
          {route.validated_in_field ? (
            <DropdownMenuItem onSelect={() => setValidated(false)}>
              <CircleOff /> Volver a de prueba
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setDialog("validate")}>
              <BadgeCheck /> Marcar como validada
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => downloadProfile(route)}>
            <FileDown /> Descargar .json
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDialog("delete")}
          >
            <Trash2 /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialog === "validate"} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Marcar "{route.name}" como validada?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hazlo solo después de recorrerla y corregirla en campo. Desde ese
              momento el asistente deja de advertir que es una ruta de prueba
              que solo se usa acompañado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => setValidated(true)}>
              Marcar como validada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialog === "delete"} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar "{route.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Los teléfonos dejan de recibirla en su próxima sesión. Descarga el
              .json antes si no tienes copia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                remove.mutate(route.slug, {
                  onSuccess: () => toast.success(`Eliminada: ${route.name}`),
                  onError: (error) => toast.error(error.message),
                })
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}
