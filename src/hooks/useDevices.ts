import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  closeDeviceSession,
  deleteDevice,
  fetchDeviceLogs,
  fetchDeviceSessions,
  fetchDevices,
  updateDevice,
} from "@/lib/api/admin"
import type { Device, DeviceUpdate } from "@/lib/api/schemas"

export const devicesKey = ["devices"] as const

/** Teléfonos del piloto; se refresca solo cada 10 s (quién entra en sesión). */
export function useDevices() {
  return useQuery({
    queryKey: devicesKey,
    queryFn: fetchDevices,
    refetchInterval: 10_000,
  })
}

export function useUpdateDevice() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DeviceUpdate }) =>
      updateDevice(id, body),
    onSuccess: (device: Device) => {
      client.setQueryData<Device[]>(devicesKey, (list) =>
        list?.map((d) => (d.id === device.id ? device : d))
      )
    },
  })
}

export function useCloseSession() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => closeDeviceSession(id),
    onSettled: () => client.invalidateQueries({ queryKey: devicesKey }),
  })
}

export function useDeleteDevice() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDevice(id),
    onSuccess: (_, id) => {
      client.setQueryData<Device[]>(devicesKey, (list) =>
        list?.filter((d) => d.id !== id)
      )
    },
  })
}

export function useDeviceLogs(id: number | null) {
  return useQuery({
    queryKey: ["device", id, "logs"],
    queryFn: () => fetchDeviceLogs(id as number),
    enabled: id !== null,
  })
}

export function useDeviceSessions(id: number | null) {
  return useQuery({
    queryKey: ["device", id, "sessions"],
    queryFn: () => fetchDeviceSessions(id as number),
    enabled: id !== null,
    refetchInterval: 15_000,
  })
}
