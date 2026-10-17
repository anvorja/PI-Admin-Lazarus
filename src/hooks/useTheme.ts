import { useContext } from "react"

import { ThemeContext, type ThemeContextValue } from "@/contexts/ThemeContext"

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider")
  }
  return context
}
