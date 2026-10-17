import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import { z } from "zod"

import { LoginPage } from "@/components/auth/LoginPage"
import { ConsolePage } from "@/components/console/ConsolePage"
import { Toaster } from "@/components/ui/sonner"
import type { AuthContextValue } from "@/contexts/AuthContext"

export interface RouterContext {
  auth: AuthContextValue
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" />
    </>
  ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ingresar",
  beforeLoad: ({ context }) => {
    if (context.auth.status === "authenticated") throw redirect({ to: "/" })
  },
  component: LoginPage,
})

const consoleSearch = z.object({
  dispositivo: z.coerce.number().int().positive().optional(),
})

const consoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: consoleSearch,
  beforeLoad: ({ context }) => {
    if (context.auth.status !== "authenticated")
      throw redirect({ to: "/ingresar" })
  },
  component: ConsolePage,
})

const routeTree = rootRoute.addChildren([loginRoute, consoleRoute])

export const router = createRouter({
  routeTree,
  context: { auth: undefined as unknown as AuthContextValue },
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
