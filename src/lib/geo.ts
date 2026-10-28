/** Geometría de los perfiles de ruta: las mismas cuentas que hace la app. */

export interface LatLon {
  lat: number
  lon: number
}

const R = 6_371_000
const rad = (deg: number) => (deg * Math.PI) / 180

/** Distancia en metros (haversine). */
export function distanceM(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Rumbo de `a` a `b`, en grados desde el norte (0–360). */
export function bearing(a: LatLon, b: LatLon): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat))
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/** Pasos aproximados, como los dice la app (`stepsFor`): 0,75 m por paso, de
 * a 5 y nunca menos de 5. */
export function stepsFor(meters: number): number {
  const steps = meters / 0.75
  return steps < 5 ? 5 : Math.round(steps / 5) * 5
}

/** Giro en un punto: positivo a la derecha, negativo a la izquierda (−180–180). */
export function turnAt(prev: LatLon, at: LatLon, next: LatLon): number {
  const delta = bearing(at, next) - bearing(prev, at)
  return ((delta + 540) % 360) - 180
}

/** Con menos de esto el GPS del teléfono no distingue dos puntos (±4–8 m). */
export const MIN_SEGMENT_M = 8

/** Un giro mayor que esto debería tener su indicación ("Gira a la …"). */
export const TURN_HINT_DEG = 35

/** La indicación ya habla del giro. */
export function mentionsTurn(instruction: string): boolean {
  return /\b(gira|giro|izquierda|derecha|dobla|voltea|diagonal|toma hacia)\b/i.test(
    instruction
  )
}
