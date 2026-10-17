import { createContext } from "react"

export type AuthStatus = "checking" | "authenticated" | "anonymous"

/** Contrato de la sesión del administrador. */
export interface AuthContextValue {
  status: AuthStatus
  username: string | null
  /** Lanza un error con el mensaje para mostrar si no entra. */
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)
