import {
  Ban,
  CircleCheck,
  FileDown,
  MoreHorizontal,
  Pencil,
  Timer,
  Trash2,
  Unplug,
} from "lucide-react"
import { useState } from "react"

import {
  DeleteDialog,
  LimitDialog,
  RenameDialog,
} from "@/components/devices/DeviceDialogs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { useDeviceActions } from "@/hooks/useDeviceActions"
import type { Device } from "@/lib/api/schemas"
import { deviceLabel } from "@/lib/format"

type Dialog = "rename" | "limit" | "delete" | null

interface DeviceMenuProps {
  device: Device
  actions: ReturnType<typeof useDeviceActions>
}

/** Acciones secundarias de un teléfono, en un menú. */
export function DeviceMenu({ device, actions }: DeviceMenuProps) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = (open: boolean) => {
    if (!open) setDialog(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Más acciones para ${deviceLabel(device)}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={() => setDialog("rename")}>
            <Pencil /> Cambiar nombre
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("limit")}>
            <Timer /> Minutos por día
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={device.status !== "approved" || device.upload_requested}
            onSelect={actions.requestLogs}
          >
            <FileDown />{" "}
            {device.upload_requested ? "Logs ya pedidos" : "Pedir logs"}
          </DropdownMenuItem>
          {device.active ? (
            <DropdownMenuItem onSelect={actions.closeSession}>
              <Unplug /> Cerrar sesión
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          {device.status === "approved" ? (
            <DropdownMenuItem variant="destructive" onSelect={actions.disable}>
              <Ban /> Deshabilitar
            </DropdownMenuItem>
          ) : device.status === "disabled" ? (
            <DropdownMenuItem onSelect={actions.enable}>
              <CircleCheck /> Habilitar
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDialog("delete")}
          >
            <Trash2 /> Borrar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "rename" ? (
        <RenameDialog
          device={device}
          open
          onOpenChange={close}
          onSave={actions.rename}
        />
      ) : null}
      {dialog === "limit" ? (
        <LimitDialog
          device={device}
          open
          onOpenChange={close}
          onSave={actions.setLimit}
        />
      ) : null}
      {dialog === "delete" ? (
        <DeleteDialog
          device={device}
          open
          onOpenChange={close}
          onConfirm={actions.remove}
        />
      ) : null}
    </>
  )
}
