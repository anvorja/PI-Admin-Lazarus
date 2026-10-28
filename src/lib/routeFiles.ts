import type { RouteProfile } from "@/lib/api/schemas"

/** Descarga el perfil como .json (para guardar una copia fuera del servidor). */
export function downloadProfile(profile: RouteProfile) {
  const blob = new Blob([JSON.stringify(profile, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${profile.slug || "ruta"}.json`
  link.click()
  URL.revokeObjectURL(url)
}
