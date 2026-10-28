import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { fetchDeviceNotes, fetchDeviceTrack } from "@/lib/api/admin"

/** Notas de campo de un teléfono (para curar rutas en el editor). */
export function useDeviceNotes(id: number | undefined) {
  return useQuery({
    queryKey: ["devices", id, "notes"],
    queryFn: () => fetchDeviceNotes(id!),
    enabled: id !== undefined,
  })
}

/** Recorrido GPS de un día del teléfono. */
export function useDeviceTrack(
  id: number | undefined,
  day: string | undefined
) {
  return useQuery({
    queryKey: ["devices", id, "track", day ?? null],
    queryFn: () => fetchDeviceTrack(id!, day),
    enabled: id !== undefined,
    placeholderData: keepPreviousData,
  })
}
