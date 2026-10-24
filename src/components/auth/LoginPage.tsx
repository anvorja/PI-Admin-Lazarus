import { useNavigate } from "@tanstack/react-router"
import { Power } from "lucide-react"
import { useId, useState, type FormEvent } from "react"

import { Wordmark } from "@/components/brand/Wordmark"
import Radar from "@/components/Radar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"

export function LoginPage() {
  const { login } = useAuth()
  const dark = useTheme().resolvedTheme === "dark"
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
        {/* El servicio como "la conexión": el radar barre mientras el
            encendido espera al centro. Con movimiento reducido queda quieto. */}
        <div className="absolute inset-0">
          <Radar
            color={dark ? "#4fd88e" : "#006934"}
            lightMode={!dark}
            mode="sweep"
            speed={0.55}
            trail={0.3}
            scale={0.62}
            ringCount={5}
            spokeCount={12}
            targets={4}
            clutter={0.18}
            glow={dark ? 0.85 : 0.4}
            gridOpacity={dark ? 0.75 : 0.55}
            grain={0.015}
            fade={0.45}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid size-[clamp(6.5rem,11vw,8.5rem)] place-items-center rounded-full border border-signal/50 bg-background/70 text-signal shadow-[0_24px_60px_-28px_var(--signal)] backdrop-blur-sm">
            <Power className="size-1/2" strokeWidth={1.5} />
          </span>
        </div>
        <div className="relative">
          <Wordmark />
        </div>
        <p className="relative max-w-[46ch] text-sm text-muted-foreground">
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
