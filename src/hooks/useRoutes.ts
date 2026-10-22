import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteRoute, fetchRoutes, saveRoute } from "@/lib/api/admin"
import type { RouteProfile } from "@/lib/api/schemas"

export const routesKey = ["routes"] as const

/** Perfiles de ruta curados cargados en el backend (HU-022). */
export function useRoutes() {
  return useQuery({ queryKey: routesKey, queryFn: fetchRoutes })
}

export function useSaveRoute() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (profile: RouteProfile) => saveRoute(profile),
    onSettled: () => client.invalidateQueries({ queryKey: routesKey }),
  })
}

export function useDeleteRoute() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => deleteRoute(slug),
    onSuccess: (_, slug) => {
      client.setQueryData<RouteProfile[]>(routesKey, (list) =>
        list?.filter((r) => r.slug !== slug)
      )
    },
  })
}
