import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import { AuthProvider } from "@/providers/AuthProvider"
import { QueryProvider } from "@/providers/QueryProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"

const root = document.getElementById("root")
if (!root) throw new Error("Falta el elemento #root")

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
)
