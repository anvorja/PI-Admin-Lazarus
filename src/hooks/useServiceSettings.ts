import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchSettings, updateSettings } from "@/lib/api/admin"
import type { Schedule, ServiceSettings } from "@/lib/api/schemas"

export const settingsKey = ["settings"] as const

/** Estado del servicio y horario; se refresca solo cada 15 s. */
export function useServiceSettings() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: fetchSettings,
    refetchInterval: 15_000,
  })
}

export function useUpdateSettings() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: { service_open?: boolean; schedule?: Schedule }) =>
      updateSettings(body),
    onSuccess: (settings: ServiceSettings) => {
      client.setQueryData(settingsKey, settings)
    },
  })
}
