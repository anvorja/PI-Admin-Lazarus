import { toast } from "sonner"

import {
  useClearLogs,
  useCloseSession,
  useDeleteDevice,
  useUpdateDevice,
} from "@/hooks/useDevices"
import type { Device, DeviceUpdate } from "@/lib/api/schemas"
import { deviceLabel } from "@/lib/format"

/** Acciones sobre un teléfono, con su aviso de éxito o error. */
export function useDeviceActions(device: Device) {
  const update = useUpdateDevice()
  const close = useCloseSession()
  const remove = useDeleteDevice()
  const clear = useClearLogs()
  const label = deviceLabel(device)

  const patch = (body: DeviceUpdate, done: string) =>
    update.mutate(
      { id: device.id, body },
      {
        onSuccess: () => toast.success(done),
        onError: (error) => toast.error(error.message),
      }
    )

  return {
    busy:
      update.isPending ||
      close.isPending ||
      remove.isPending ||
      clear.isPending,
    approve: () => patch({ status: "approved" }, `${label} aprobado`),
    disable: () => patch({ status: "disabled" }, `${label} deshabilitado`),
    enable: () => patch({ status: "approved" }, `${label} habilitado`),
    rename: (name: string) => patch({ name }, "Nombre guardado"),
    setLimit: (minutes: number) =>
      patch(
        { daily_minutes_limit: minutes },
        minutes > 0 ? `Límite: ${minutes} min por día` : "Sin límite diario"
      ),
    requestLogs: () =>
      patch(
        { upload_requested: true },
        device.active
          ? "Logs pedidos: llegan cuando termine su sesión"
          : "Logs pedidos: llegan cuando empiece su próxima sesión"
      ),
    clearLogs: () =>
      clear.mutate(device.id, {
        onSuccess: () => toast.success(`Logs de ${label} borrados`),
        onError: (error) => toast.error(error.message),
      }),
    closeSession: () =>
      close.mutate(device.id, {
        onSuccess: (closed) =>
          closed
            ? toast.success(`Sesión de ${label} cerrada`)
            : toast.info(`${label} ya no estaba en sesión`),
        onError: (error) => toast.error(error.message),
      }),
    remove: () =>
      remove.mutate(device.id, {
        onSuccess: () => toast.success(`${label} borrado`),
        onError: (error) => toast.error(error.message),
      }),
  }
}
