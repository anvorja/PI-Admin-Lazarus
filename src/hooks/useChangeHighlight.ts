import { useCallback, useEffect, useRef, useState } from "react"

import type { Device } from "@/lib/api/schemas"

function signature(device: Device): string {
  return `${device.status}|${device.active}|${device.upload_requested}`
}

/**
 * Teléfonos cuyo estado cambió desde la última vez que se miró la lista (entró
 * en sesión, se registró uno nuevo…). Quedan resaltados hasta que el
 * coordinador pasa por encima o los enfoca: un cambio no se pierde por haber
 * llegado mientras miraba otra cosa.
 */
export function useChangeHighlight(devices: Device[] | undefined) {
  const seen = useRef<Map<number, string> | null>(null)
  const [changed, setChanged] = useState<ReadonlySet<number>>(new Set())

  useEffect(() => {
    if (!devices) return
    const previous = seen.current
    const next = new Map(devices.map((d) => [d.id, signature(d)]))
    seen.current = next
    if (previous === null) return // primera carga: nada es "nuevo"
    const fresh = devices
      .filter((d) => previous.get(d.id) !== next.get(d.id))
      .map((d) => d.id)
    if (fresh.length) {
      setChanged((current) => new Set([...current, ...fresh]))
    }
  }, [devices])

  const acknowledge = useCallback((id: number) => {
    setChanged((current) => {
      if (!current.has(id)) return current
      const copy = new Set(current)
      copy.delete(id)
      return copy
    })
  }, [])

  return { changed, acknowledge }
}
