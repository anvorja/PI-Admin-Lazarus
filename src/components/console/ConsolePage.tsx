import { getRouteApi } from "@tanstack/react-router"

import { AppHeader } from "@/components/console/AppHeader"
import { CapacitySection } from "@/components/console/CapacitySection"
import { RoutesSection } from "@/components/console/RoutesSection"
import { UsageSection } from "@/components/console/UsageSection"
import {
  ScheduleSection,
  ServicePanel,
} from "@/components/console/ServicePanel"
import { DeviceList } from "@/components/devices/DeviceList"
import { DeviceSheet } from "@/components/devices/DeviceSheet"
import { useDevices } from "@/hooks/useDevices"

const route = getRouteApi("/")

/** La consola: servicio, rutas y horario a la izquierda; teléfonos y capacidad a la derecha. */
export function ConsolePage() {
  const { dispositivo } = route.useSearch()
  const navigate = route.useNavigate()
  const devices = useDevices()
  const selected = devices.data?.find((d) => d.id === dispositivo)

  const open = (id: number) => void navigate({ search: { dispositivo: id } })
  const close = () => void navigate({ search: {} })

  return (
    <div className="min-h-dvh">
      <AppHeader />
      {/* Dos columnas independientes en escritorio, para que la lista corta de
          teléfonos no deje un hueco. En el teléfono es una sola columna con lo
          que más se mira arriba: servicio, consumo, teléfonos, capacidad, rutas
          y horario. */}
      <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:py-8 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8 lg:py-10">
        <h1 className="sr-only">Consola del piloto</h1>
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <section
            aria-label="Servicio"
            className="order-1 rounded-lg border bg-card/70 p-6 shadow-[0_24px_60px_-40px_oklch(0.2_0.04_260/50%)] sm:p-8 lg:order-none"
          >
            <ServicePanel devices={devices.data} />
          </section>
          <section
            aria-label="Consumo del mes"
            className="order-2 rounded-lg border bg-card/70 p-6 sm:p-8 lg:order-none"
          >
            <UsageSection />
          </section>
          <section
            aria-label="Rutas"
            className="order-5 rounded-lg border bg-card/70 p-6 sm:p-8 lg:order-none"
          >
            <RoutesSection />
          </section>
          <section
            aria-label="Horario"
            className="order-6 rounded-lg border bg-card/70 p-6 sm:p-8 lg:order-none"
          >
            <ScheduleSection />
          </section>
        </div>
        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-10">
          <div className="order-3 min-w-0 lg:order-none">
            <DeviceList
              devices={devices.data}
              loading={devices.isPending}
              error={devices.error}
              onRetry={() => void devices.refetch()}
              onOpen={open}
            />
          </div>
          <section
            aria-label="Capacidad"
            className="@container order-4 min-w-0 rounded-lg border bg-card/70 p-6 sm:p-8 lg:order-none"
          >
            <CapacitySection />
          </section>
        </div>
      </main>
      <DeviceSheet device={selected} onClose={close} />
    </div>
  )
}
