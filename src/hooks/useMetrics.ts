import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { fetchMetrics } from "@/lib/api/admin"

/** Capacidad del servidor; se refresca cada 30 s, el ritmo del muestreo. */
export function useMetrics(hours: number) {
  return useQuery({
    queryKey: ["metrics", hours],
    queryFn: () => fetchMetrics(hours),
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  })
}
