import { useQueryClient } from "@tanstack/react-query"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { AuthContext, type AuthStatus } from "@/contexts/AuthContext"
import {
  login as apiLogin,
  logout as apiLogout,
  refreshSession,
  setSessionExpiredHandler,
} from "@/lib/api/client"

/**
 * Sesión del administrador: al abrir el panel intenta renovarla con la cookie
 * del refresh; si no hay, muestra el ingreso.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>("checking")
  const [username, setUsername] = useState<string | null>(null)

  const expire = useCallback(() => {
    setUsername(null)
    setStatus("anonymous")
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    let alive = true
    void refreshSession().then((token) => {
      if (!alive) return
      if (token) {
        setUsername(token.username)
        setStatus("authenticated")
      } else {
        setStatus("anonymous")
      }
    })
    setSessionExpiredHandler(expire)
    return () => {
      alive = false
      setSessionExpiredHandler(null)
    }
  }, [expire])

  const login = useCallback(async (user: string, password: string) => {
    const token = await apiLogin(user, password)
    setUsername(token.username)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    expire()
  }, [expire])

  const value = useMemo(
    () => ({ status, username, login, logout }),
    [status, username, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
