import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  fetchDeviceNotes,
  fetchDeviceTrack,
  reviewDeviceNote,
} from "@/lib/api/admin"
import type { FieldNote, NoteReview } from "@/lib/api/schemas"

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

/** Marca una nota (aplicada, descartada o pendiente) y actualiza la lista al momento. */
export function useReviewNote(id: number | undefined) {
  const client = useQueryClient()
  const key = ["devices", id, "notes"]
  return useMutation({
    mutationFn: ({ note, status }: { note: FieldNote; status: NoteReview }) =>
      reviewDeviceNote(id!, note, status),
    onSuccess: (_, { note, status }) => {
      client.setQueryData<FieldNote[]>(key, (notes) =>
        notes?.map((n) =>
          n.at === note.at && n.text === note.text
            ? { ...n, review: status }
            : n
        )
      )
    },
  })
}
