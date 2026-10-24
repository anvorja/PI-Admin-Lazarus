// Tipos del fondo Radar de React Bits (Radar.jsx, instalado con
// `npx shadcn@latest add @react-bits/Radar-JS-CSS`). El componente es JS de
// terceros: se tipa aquí para usarlo desde TypeScript estricto.
import type { HTMLAttributes, JSX } from "react"

export interface RadarProps extends HTMLAttributes<HTMLDivElement> {
  /** Color de las líneas y del barrido (cualquier color CSS que entienda canvas). */
  color?: string
  backgroundColor?: string
  mode?: "sweep" | "pulse"
  speed?: number
  trail?: number
  scale?: number
  ringCount?: number
  spokeCount?: number
  ticks?: boolean
  targets?: number
  clutter?: number
  glow?: number
  brightness?: number
  gridOpacity?: number
  lineWidth?: number
  tilt?: number
  centerX?: number
  centerY?: number
  mouseInteraction?: boolean
  intro?: boolean
  grain?: number
  fade?: number
  opacity?: number
  lightMode?: boolean
  paused?: boolean
  dpr?: number
}

export default function Radar(props: RadarProps): JSX.Element
