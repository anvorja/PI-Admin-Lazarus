import { getRouteApi } from "@tanstack/react-router"

import { AppHeader } from "@/components/console/AppHeader"
import {
  ScheduleSection,
  ServicePanel,
} from "@/components/console/ServicePanel"
import { DeviceList } from "@/components/devices/DeviceList"
import { DeviceSheet } from "@/components/devices/DeviceSheet"
import { useDevices } from "@/hooks/useDevices"

const route = getRouteApi("/")

/** La consola: servicio a la izquierda, teléfonos a la derecha. */
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
      <main className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:py-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-6 lg:px-8 lg:py-10">
        <h1 className="sr-only">Consola del piloto</h1>
        <section
          aria-label="Servicio"
          className="rounded-lg border bg-card/70 p-6 shadow-[0_24px_60px_-40px_oklch(0.2_0.04_260/50%)] sm:p-8 lg:col-start-1 lg:row-start-1"
        >
          <ServicePanel devices={devices.data} />
        </section>
        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <DeviceList
            devices={devices.data}
            loading={devices.isPending}
            error={devices.error}
            onRetry={() => void devices.refetch()}
            onOpen={open}
          />
        </div>
        <section
          aria-label="Horario"
          className="h-fit rounded-lg border bg-card/70 p-6 sm:p-8 lg:col-start-1 lg:row-start-2"
        >
          <ScheduleSection />
        </section>
      </main>
      <DeviceSheet device={selected} onClose={close} />
    </div>
  )
}
