---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface brief: consola del piloto (src/App.tsx)

Scope: toda la app del panel (login, consola, detalle de dispositivo). Mode: Operate.
Audience/job: el coordinador, en escritorio y en el celular en la estación; abrir o cerrar el servicio, aprobar teléfonos, cortar sesiones, descargar logs.
Constraints: español; WCAG 2.2 AA; seudónimos, nunca contenido de logs; tema oscuro y claro.

## Direction contract

THESIS: la consola es una app de VPN para un piloto: el servicio es "la conexión" y se controla con un solo botón de encendido central con su estado vivo; los teléfonos son la "lista de servidores" con su ping (latencia voz a voz). Rechaza el admin genérico de barra lateral, tabla gris y tarjetas de KPI iguales.

OWN-WORLD: fondo tinta azul nocturno en oscuro y gris niebla en claro; un solo acento, verde señal, reservado para "abierto / en sesión / aprobar"; rojo solo para acciones destructivas y "cerrado". Geist para todo, Geist Mono para cifras (minutos, ms, IP). Radios 16px en superficies y pill en el botón de encendido y chips de estado. Anillo de estado alrededor del botón.

STORY: entra, ve en un vistazo si se está gastando saldo y quién está en sesión; abre/cierra con un toque; aprueba al pendiente; abre un teléfono y descarga sus logs.

FIRST VIEWPORT: escritorio: columna izquierda (≈380px) con el botón de encendido grande centrado, su estado en texto ("Abierto: los teléfonos aprobados pueden usar Lazarus") y debajo el horario; derecha: lista de teléfonos con pendientes arriba, cada fila con seudónimo, modelo, estado, minutos de hoy y ping. Celular: botón de encendido arriba, lista debajo; detalle en hoja deslizante.

FORM: mundo fijado por el usuario (webs modernas de VPN, referencia PrivateVPN); seed 0a5d5a60 corrido, la dirección fijada gana. Raise del retador "split-flap concourse": las filas se actualizan en su lugar sin reordenarse de golpe y un cambio de estado queda resaltado hasta verlo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
