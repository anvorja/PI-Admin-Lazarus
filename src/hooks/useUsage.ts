import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { checkGemini, fetchUsage } from "@/lib/api/admin"

/** Consumo del mes (HU-051); se refresca cada minuto. */
export function useUsage() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: fetchUsage,
    refetchInterval: 60_000,
  })
}

/** "Probar Gemini": una sesión mínima desde el backend, sin audio. */
export function useCheckGemini() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: checkGemini,
    onSettled: () => void client.invalidateQueries({ queryKey: ["usage"] }),
  })
}
