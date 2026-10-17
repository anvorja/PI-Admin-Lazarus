import { useContext } from "react"

import { AuthContext, type AuthContextValue } from "@/contexts/AuthContext"

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
