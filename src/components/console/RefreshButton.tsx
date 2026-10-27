import { useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Vuelve a pedir todo lo que está en pantalla (dispositivos, métricas,
 * rutas, registros) sin recargar la página. */
export function RefreshButton() {
  const client = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  async function refresh() {
    setRefreshing(true)
    try {
      await client.refetchQueries({ type: "active" })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Actualizar datos"
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          <RefreshCw className={cn(refreshing && "motion-safe:animate-spin")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Actualizar datos</TooltipContent>
    </Tooltip>
  )
}
