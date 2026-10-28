import { useCallback, useReducer } from "react"

import type { RouteProfile } from "@/lib/api/schemas"

export type RoutePoint = RouteProfile["points"][number]

/** Lo que se puede cambiar del perfil fuera de sus puntos. */
export type ProfileMeta = Omit<RouteProfile, "points">

interface State {
  past: RouteProfile[]
  present: RouteProfile
  future: RouteProfile[]
  /** Lo último guardado en el servidor: si difiere, hay cambios sin guardar. */
  saved: RouteProfile
  /** Ediciones seguidas del mismo campo (escribir un nombre) son un solo paso
   * de deshacer. */
  lastKey: string | null
}

type Action =
  | { type: "change"; next: RouteProfile; key?: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "saved"; profile: RouteProfile }

const HISTORY = 100

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "change": {
      if (action.key && action.key === state.lastKey) {
        return { ...state, present: action.next, future: [] }
      }
      return {
        ...state,
        past: [...state.past, state.present].slice(-HISTORY),
        present: action.next,
        future: [],
        lastKey: action.key ?? null,
      }
    }
    case "undo": {
      const previous = state.past.at(-1)
      if (!previous) return state
      return {
        ...state,
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        lastKey: null,
      }
    }
    case "redo": {
      const [next, ...rest] = state.future
      if (!next) return state
      return {
        ...state,
        past: [...state.past, state.present],
        present: next,
        future: rest,
        lastKey: null,
      }
    }
    case "saved":
      return { ...state, present: action.profile, saved: action.profile }
  }
}

/** Borrador de un perfil de ruta en el editor, con deshacer y rehacer. */
export function useRouteDraft(initial: RouteProfile) {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: initial,
    future: [],
    saved: initial,
    lastKey: null,
  })
  const draft = state.present

  const change = useCallback(
    (next: RouteProfile, key?: string) =>
      dispatch({ type: "change", next, key }),
    []
  )

  const setMeta = (patch: Partial<ProfileMeta>, key?: string) =>
    change({ ...draft, ...patch }, key)

  const updatePoint = (
    index: number,
    patch: Partial<RoutePoint>,
    key?: string
  ) =>
    change(
      {
        ...draft,
        points: draft.points.map((p, i) =>
          i === index ? { ...p, ...patch } : p
        ),
      },
      key
    )

  const insertPoint = (at: number, point: RoutePoint) => {
    const points = [...draft.points]
    points.splice(at, 0, point)
    change({ ...draft, points })
  }

  const removePoint = (index: number) =>
    change({ ...draft, points: draft.points.filter((_, i) => i !== index) })

  const movePoint = (index: number, to: number) => {
    if (to < 0 || to >= draft.points.length) return
    const points = [...draft.points]
    const [point] = points.splice(index, 1)
    points.splice(to, 0, point)
    change({ ...draft, points })
  }

  return {
    draft,
    dirty: JSON.stringify(draft) !== JSON.stringify(state.saved),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    markSaved: (profile: RouteProfile) => dispatch({ type: "saved", profile }),
    setMeta,
    updatePoint,
    insertPoint,
    removePoint,
    movePoint,
  }
}

export type RouteDraft = ReturnType<typeof useRouteDraft>

/** Punto nuevo con los radios que usan los perfiles de la estación. */
export function newPoint(
  lat: number,
  lon: number,
  name = "Punto nuevo"
): RoutePoint {
  return {
    name,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    instruction: "",
    risk: "low",
    crossing: null,
    approach_m: 12,
    arrive_m: 5,
  }
}

/** Dónde insertar un punto para que el recorrido se alargue lo menos posible. */
export function bestInsertIndex(
  points: RoutePoint[],
  at: { lat: number; lon: number },
  distance: (
    a: { lat: number; lon: number },
    b: { lat: number; lon: number }
  ) => number
): number {
  if (points.length === 0) return 0
  let best = points.length
  let bestCost = distance(points[points.length - 1], at)
  const first = distance(at, points[0])
  if (first < bestCost) {
    best = 0
    bestCost = first
  }
  for (let i = 1; i < points.length; i++) {
    const cost =
      distance(points[i - 1], at) +
      distance(at, points[i]) -
      distance(points[i - 1], points[i])
    if (cost < bestCost) {
      best = i
      bestCost = cost
    }
  }
  return best
}
