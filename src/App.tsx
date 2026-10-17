import { RouterProvider } from "@tanstack/react-router"
import { useEffect } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import { router } from "@/router"

/** Monta el router cuando ya se sabe si hay sesión (sin parpadeo del ingreso). */
export function App() {
  const auth = useAuth()

  useEffect(() => {
    if (auth.status !== "checking") void router.invalidate()
  }, [auth.status])

  if (auth.status === "checking") {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <span className="size-10 animate-pulse rounded-full border border-signal/50 bg-signal-soft" />
        <span className="sr-only">Comprobando la sesión…</span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <RouterProvider router={router} context={{ auth }} />
    </TooltipProvider>
  )
}

export default App
