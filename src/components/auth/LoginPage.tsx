import { useNavigate } from "@tanstack/react-router"
import { Power } from "lucide-react"
import { useId, useState, type FormEvent } from "react"

import { Wordmark } from "@/components/brand/Wordmark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const id = useId()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      await login(username.trim(), password)
      await navigate({ to: "/" })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo entrar.")
      setPassword("")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section
        aria-hidden
        className="relative hidden overflow-hidden border-r bg-card/40 lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <Wordmark />
        <div className="relative mx-auto grid size-[min(38vw,30rem)] place-items-center">
          {[0, 1, 2, 3].map((ring) => (
            <span
              key={ring}
              className="absolute rounded-full border border-signal/20"
              style={{ inset: `${ring * 12}%` }}
            />
          ))}
          <span className="grid size-[28%] place-items-center rounded-full border border-signal/60 bg-signal-soft text-signal shadow-[0_30px_80px_-30px_var(--signal)]">
            <Power className="size-1/2" strokeWidth={1.5} />
          </span>
        </div>
        <p className="max-w-[46ch] text-sm text-muted-foreground">
          Abre y cierra el servicio de las jornadas de campo, aprueba los
          teléfonos del piloto y descarga sus registros.
        </p>
      </section>

      <section className="flex flex-col justify-center px-4 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Solo para quien coordina las pruebas.
            </p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-user`}>Usuario</Label>
              <Input
                id={`${id}-user`}
                autoComplete="username"
                autoCapitalize="none"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-pass`}>Contraseña</Label>
              <Input
                id={`${id}-pass`}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error !== null}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-11"
              />
            </div>
            {error ? (
              <p
                id={`${id}-error`}
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              disabled={sending || !username.trim() || !password}
            >
              {sending ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
