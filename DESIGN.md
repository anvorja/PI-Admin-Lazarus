---
name: Lazarus, consola del piloto
description: Panel del coordinador del piloto de Lazarus, construido como una app de VPN con el servicio como "la conexión".
colors:
  background: "oklch(0.972 0.006 250)"
  background-dark: "oklch(0.155 0.026 258)"
  foreground: "oklch(0.22 0.032 262)"
  foreground-dark: "oklch(0.955 0.008 250)"
  card: "oklch(0.995 0.002 250)"
  card-dark: "oklch(0.198 0.03 258)"
  popover: "oklch(0.995 0.002 250)"
  popover-dark: "oklch(0.215 0.032 258)"
  primary: "oklch(0.22 0.032 262)"
  primary-foreground: "oklch(0.99 0 0)"
  primary-dark: "oklch(0.955 0.008 250)"
  primary-foreground-dark: "oklch(0.2 0.03 260)"
  secondary: "oklch(0.93 0.01 252)"
  secondary-dark: "oklch(0.255 0.032 258)"
  muted: "oklch(0.94 0.008 252)"
  muted-dark: "oklch(0.245 0.03 258)"
  muted-foreground: "oklch(0.47 0.025 260)"
  muted-foreground-dark: "oklch(0.72 0.022 255)"
  accent: "oklch(0.93 0.012 252)"
  accent-dark: "oklch(0.27 0.034 258)"
  border: "oklch(0.885 0.012 255)"
  border-dark: "oklch(0.86 0.03 255 / 11%)"
  input: "oklch(0.62 0.02 255)"
  input-dark: "oklch(0.86 0.03 255 / 16%)"
  ring: "oklch(0.22 0.032 262 / 55%)"
  ring-dark: "oklch(0.955 0.008 250 / 55%)"
  signal: "oklch(0.45 0.13 156)"
  signal-dark: "oklch(0.79 0.16 156)"
  signal-fg: "oklch(0.99 0.01 156)"
  signal-fg-dark: "oklch(0.2 0.045 160)"
  signal-soft: "oklch(0.56 0.14 156 / 12%)"
  signal-soft-dark: "oklch(0.79 0.16 156 / 14%)"
  halt: "oklch(0.5 0.19 27)"
  halt-dark: "oklch(0.68 0.19 25)"
  halt-soft: "oklch(0.55 0.2 27 / 10%)"
  halt-soft-dark: "oklch(0.68 0.19 25 / 14%)"
  wait: "oklch(0.52 0.12 65)"
  wait-dark: "oklch(0.82 0.13 78)"
  wait-soft: "oklch(0.72 0.14 75 / 16%)"
  wait-soft-dark: "oklch(0.82 0.13 78 / 14%)"
  ground-glow: "oklch(0.56 0.14 156 / 7%)"
  ground-glow-dark: "oklch(0.79 0.16 156 / 6%)"
typography:
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.333
  data-hero:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.111
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  data-figure:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "tnum"
  data:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "tnum"
  data-small:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.333
    fontFeature: "tnum"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
components:
  button-ink:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-fg}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.halt-soft}"
    textColor: "{colors.halt}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  power-button-open:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal}"
    rounded: "{rounded.full}"
    size: "160px"
  power-button-scheduled:
    backgroundColor: "{colors.wait-soft}"
    textColor: "{colors.wait}"
    rounded: "{rounded.full}"
    size: "160px"
  power-button-closed:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    size: "160px"
  chip-live:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  chip-pending:
    backgroundColor: "{colors.wait-soft}"
    textColor: "{colors.wait}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  chip-approved:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  chip-disabled:
    backgroundColor: "{colors.halt-soft}"
    textColor: "{colors.halt}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  filter-segment-selected:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "32px"
  device-row:
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  device-row-highlighted:
    backgroundColor: "{colors.signal-soft}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  panel:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "32px"
  input:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
---

# Design System: Lazarus, consola del piloto

## Overview

**Creative North Star: "El botón de conectar"**

La consola se construyó como una app de VPN: el servicio de Lazarus es "la conexión" y se gobierna con un solo botón de encendido redondo, grande y central, rodeado de anillos que cambian de color con su estado. Los teléfonos del piloto son la "lista de servidores": filas limpias con su estado, sus minutos de hoy y su ping (latencia voz a voz). El estado se lee de lejos antes que cualquier otra cosa; todo lo demás es tinta y niebla.

El mundo es sobrio y nocturno. En oscuro, un fondo de tinta azul (oklch 0.155, tono 258) con superficies apenas más claras; en claro, una niebla gris azulada. Sobre esa base hay un solo acento, el verde señal, y dos colores de estado: rojo para lo destructivo y lo cerrado, ámbar para lo que espera una decisión. Un resplandor verde muy tenue (ground-glow, 6-7 % de opacidad) se filtra desde la esquina superior izquierda del fondo, como la luz de un equipo encendido. La densidad es de herramienta de operación: filas compactas, cifras en mono tabular, sin decoración.

El sistema rechaza, por decisión del usuario, el admin genérico de barra lateral, tabla gris y fila de tarjetas de KPI iguales.

**Key Characteristics:**
- Un control protagonista (el encendido) y una lista; nada compite con ellos.
- Un solo acento, reservado para el estado "vivo"; el resto de la interfaz es tinta.
- Geist para todo; Geist Mono con cifras tabulares solo para números y datos técnicos.
- Superficies de 16px de radio; pill para lo que es estado o selección (encendido, chips, filtros, días).
- Tema oscuro y claro con los mismos roles; el oscuro es el de referencia.

## Colors

Tinta nocturna y niebla con un verde señal escaso: el color significa estado, nunca adorno.

### Primary
- **Verde señal** (signal; oscuro signal-dark): el único acento. Relleno del botón "Aprobar" (con texto signal-fg), icono y anillos del encendido abierto, chip "En sesión" con su punto que late, borde y tinte de la fila resaltada, icono del teléfono en sesión y días activos del horario (los días en que el servicio abre). En claro es un verde oscuro (L 0.45) para que su texto pase AA; en oscuro sube a L 0.79.
- **Tinte señal** (signal-soft): el fondo translúcido de todo lo anterior (12 % en claro, 14 % en oscuro). También es el color de la selección de texto.
- **Resplandor de fondo** (ground-glow): degradado radial fijo `120% 70% at 18% -10%` sobre el body; deriva del mismo verde.

### Secondary
- **Rojo alto** (halt; igual a destructive): acciones destructivas (borrar, deshabilitar, "Cerrar el servicio" en la confirmación) y el chip "Deshabilitado". Su tinte halt-soft (10 % / 14 %) es el fondo del chip y del botón destructivo.

### Tertiary
- **Ámbar espera** (wait, wait-soft): lo que espera una decisión. Chip "Pendiente", icono del teléfono pendiente y la fase "Fuera de horario" del encendido.

### Neutral
- **Tinta** (foreground / primary): texto principal y relleno de los botones comunes ("Guardar horario", "Descargar .zip", "Entrar"). En oscuro se invierte a casi blanco sobre tinta.
- **Niebla / tinta nocturna** (background): el lienzo.
- **Superficie** (card, popover): paneles del servicio y del horario (al 70 % de opacidad sobre el fondo), hoja de detalle, diálogos y menús.
- **Gris de apoyo** (muted, muted-foreground): textos secundarios, leyendas bajo las cifras, chip "Aprobado".
- **Secundario y acento** (secondary, accent): fondos de hover y de elementos de menú.
- **Bordes** (border, input, ring): líneas de 1px; en oscuro son translúcidas (11 % y 16 %). El anillo de foco usa la tinta al 55 %.

### Named Rules
**The Reserved Signal Rule.** El verde señal significa "abierto", "en sesión" o "aprobar", y nada más. Un botón común es de tinta, no verde. La única aparición del verde fuera de un estado es el emblema de la marca (el icono de encendido del wordmark y los anillos de la ilustración del login), porque el encendido es la marca.

**The Three Lights Rule.** Verde para lo vivo, ámbar para lo que espera, rojo para lo destructivo y lo cerrado. Cada uno lleva su tinte -soft como fondo y su color pleno como texto o borde; no se mezclan en un mismo elemento.

**The Ink Default Rule.** Si un control no expresa estado, va en tinta (primary), outline o ghost.

## Typography

**Display Font:** Geist Variable (con ui-sans-serif, system-ui, sans-serif)
**Body Font:** Geist Variable
**Label/Mono Font:** Geist Mono Variable (con ui-monospace, monospace)

**Character:** Una sola familia geométrica y neutra para la interfaz, con su gemela mono para todo lo que se mide o se copia. La mono hace que las cifras se lean como instrumentos.

### Hierarchy
- **Display** (600, 1.875rem, 1.2, tracking -0.025em): el estado del encendido ("Abierto", "Cerrado", "Fuera de horario") y el título "Entrar" del login.
- **Headline** (600, 1.5rem, 1.333, tracking -0.025em): títulos de sección ("Teléfonos") y el seudónimo en la hoja de detalle.
- **Title** (500, 1rem, 1.5): el seudónimo en cada fila y etiquetas de ajuste del horario.
- **Body** (400, 0.875rem, 1.43): descripciones y ayudas, en muted-foreground; el texto del estado se limita a 30ch y los vacíos a 44ch.
- **Label** (500, 0.75rem, 1.333): chips de estado y leyendas bajo las cifras ("ping", "hoy", "En sesión").
- **Data** (Geist Mono, tabular-nums): latencia mediana (500, 2.25rem), cifras del servicio (500, 1.25rem), ping y minutos de cada fila (0.875rem), modelo, Android, versión, IP, nombres de archivo y horas (0.75rem).

### Named Rules
**The Mono Means Measured Rule.** Geist Mono con `tabular-nums` solo para cifras y datos técnicos (minutos, ms o s, conteos, IP, modelo, versión, archivos, horas). Nunca para títulos, etiquetas ni prosa.

**The Sentence Case Rule.** Todo en minúscula de oración, sin mayúsculas sostenidas ni tracking ancho; la jerarquía la dan el tamaño y el peso.

## Layout

Contenedor centrado de hasta 1400px con márgenes de 16px (32px desde lg). Cabecera fija de 64px con el wordmark a la izquierda y el menú de cuenta y tema a la derecha, sobre el fondo al 65-80 % con desenfoque.

Desde lg (1024px) la consola es una rejilla de dos columnas: 400px a la izquierda para el panel del servicio (encendido y cifras) y debajo el horario; el resto a la derecha para la lista de teléfonos, que ocupa las dos filas. Separación de 40px entre columnas y 24px entre filas. En el celular todo es una sola columna: servicio, lista y luego horario.

Ritmo: 6px entre filas de la lista, 16-24px dentro de grupos, 24px de padding en paneles (32px desde sm). La hoja de detalle ocupa todo el ancho en el celular y hasta 448px desde sm, con secciones separadas por un borde superior y 24px de margen lateral.

**The Fixed Columns Rule.** Desde md (768px) cada fila de teléfono usa columnas fijas: icono, nombre (flexible), estado (9rem), ping (4.5rem), minutos (6.5rem) y acciones (9.5rem). Las cifras de todas las filas quedan alineadas en vertical como una tabla sin serlo. En el celular, estado, minutos y ping bajan a una segunda línea.

## Elevation & Depth

Profundidad por capas tonales más un brillo de color, no por sombras grises. Las superficies son card sobre background con bordes de 1px; las sombras son largas, difusas y con spread negativo, y solo se tiñen del color del estado.

### Shadow Vocabulary
- **Panel en reposo** (`box-shadow: 0 24px 60px -40px oklch(0.2 0.04 260 / 50%)`): el panel del servicio.
- **Encendido abierto** (`box-shadow: 0 18px 50px -18px var(--signal)`): el resplandor verde bajo el botón.
- **Encendido fuera de horario** (`box-shadow: 0 18px 50px -22px var(--wait)`).
- **Encendido cerrado** (`box-shadow: 0 18px 40px -24px oklch(0.2 0.03 260 / 45%)`).
- **Fila resaltada** (`box-shadow: 0 10px 30px -18px var(--signal)`).
- **Capas superpuestas**: hoja, diálogos y menús en popover con un velo `black / 10%` y desenfoque leve.

### Named Rules
**The State Glow Rule.** Una sombra con color solo acompaña a un estado (encendido, fila cambiada). Lo que no tiene estado se queda plano o con la sombra neutra del panel.

## Shapes

Esquinas suaves y círculos. Superficies, filas, botones de texto y campos usan 16px (rounded.lg, `--radius: 1rem`); los botones pequeños bajan a 12px; el icono de teléfono de cada fila y los diálogos de alerta usan 20px. Lo circular se reserva para lo que es estado o selección: el encendido y sus anillos, el icono del wordmark, los chips de estado, el segmentado de filtros y los días del horario. Bordes de 1px en todo; los estados vacíos y de error usan borde discontinuo.

## Components

### Buttons
Directos y en tinta; el verde solo cuando el botón aprueba.
- **Shape:** 16px de radio (12px en tamaño sm); alto 36px por defecto, 32px en sm, 44px en lg.
- **Primary (tinta):** primary sobre primary-foreground, 14px de padding lateral, 500 a 0.875rem. Hover al 80 %.
- **Signal:** solo para "Aprobar", en la fila y en la hoja. signal con texto signal-fg; hover al 85 %.
- **Outline:** fondo del lienzo con borde; "Cerrar sesión", "Pedir logs".
- **Ghost:** menú de cuenta, "Descartar", "Cancelar", menú de tres puntos.
- **Destructive:** tinte halt-soft con texto halt.
- **Hover / Focus:** foco con borde ring y halo de 3px al 50 %; al pulsar baja 1px; deshabilitado al 50 %.

### Power Control (componente firma)
Un botón circular de 160px dentro de un aro de 224px, con un anillo interior a 12px del borde. Tres fases, con transición de 500ms en ease-out-expo:
- **Abierto:** tinte signal-soft, icono y borde en signal, resplandor verde. Si hay teléfonos en sesión, un anillo exterior late (escala 0.86 a 1.06, opacidad 0.6 a 0, 2.4s, en bucle).
- **Fuera de horario:** encendido pero fuera de las jornadas; tinte, borde e icono en wait.
- **Cerrado:** superficie card, icono en muted-foreground (foreground al hover), sombra neutra.
Debajo, el estado en Display y una frase que explica la consecuencia, en una región `aria-live="polite"`. El botón lleva `aria-pressed` y un `aria-label` que nombra la acción ("Abrir el servicio" / "Cerrar el servicio"). Al tocar se encoge a 0.96. Cerrar con teléfonos en sesión pide confirmación en un diálogo de alerta. Debajo, tres cifras en mono separadas por bordes horizontales (en sesión, pendientes, aprobados).

### Chips
- **Style:** pill de 24px de alto, 10px de padding, Label 0.75rem/500, sin borde; tinte -soft de fondo y color pleno de texto.
- **State:** "En sesión" (signal, con un punto de 6px que hace ping), "Pendiente" (wait), "Aprobado" (muted), "Deshabilitado" (halt). "En sesión" manda sobre "Aprobado".

### Filtros
Segmentado en pill dentro de un contenedor pill con borde y card al 60 %: "Todos", "Pendientes", "En sesión", "Deshabilitados", cada uno con su conteo en mono al 70 %. El seleccionado se invierte a foreground sobre background. Cada segmento usa `aria-pressed`; el grupo lleva `aria-label`.

### Fila de teléfono (componente firma)
- **Forma:** 16px de radio, 14px por 16px de padding, borde transparente en reposo; al hover, borde y card al 70 %. Columnas fijas (ver Layout).
- **Contenido:** icono de 44px en caja de 20px de radio, teñido por estado (signal en sesión, wait pendiente, neutro el resto); seudónimo en Title con un chevron que aparece al hover; debajo modelo, Android y versión en mono 0.75rem. Sin seudónimo, "Sin nombre (modelo)" en cursiva y gris.
- **Resaltado de cambios:** cuando un teléfono cambia de estado (entra en sesión, se registra, pide logs) la fila queda con borde signal al 50 %, tinte signal-soft y resplandor, hasta que el puntero pasa por encima o recibe foco. Los cambios se anuncian en una región `aria-live="polite"` oculta.
- **Orden congelado:** las filas se actualizan en su sitio; los teléfonos nuevos entran arriba. La lista solo se reordena (pendientes, en sesión, aprobados, deshabilitados y luego por nombre) en la primera carga, al cambiar de filtro o cuando ya se vieron todos los cambios. El desplazamiento usa layout animation de 450ms en ease-out-expo.

### Hoja de detalle
Panel lateral derecho en popover (pantalla completa en el celular, 448px desde sm). Cabecera con el seudónimo en Headline, su chip y los datos técnicos en mono; acciones según estado. Secciones con título 0.875rem/500 separadas por borde: Hoy, Latencia (mediana en mono 2.25rem y p90), Logs de campo (lista de archivos en mono y "Descargar .zip" en tinta), Últimas sesiones.

### Diálogos
Alerta centrada en popover, 20px de radio, anillo de 1px en foreground al 10 %, entra con fade y zoom desde 95 %. La acción destructiva va en halt y la cancelación nombra lo que se conserva ("Dejar abierto"). Borrar siempre confirma.

### Inputs / Fields
- **Style:** borde input de 1px, fondo transparente (input al 30 % en oscuro), 16px de radio, 32px de alto (44px en el login). Horas y límites en mono tabular.
- **Focus:** borde ring y halo de 3px al 50 %.
- **Error / Disabled:** borde y halo en destructive; mensaje en destructive con `role="alert"`. Deshabilitado al 50 % (el grupo del horario apagado, al 45 %).

### Navigation
Sin barra lateral: cabecera fija con el wordmark (icono de encendido en un círculo signal-soft, "Lazarus" en 600 y "Consola del piloto" en 0.75rem) y un botón ghost de cuenta que abre el menú de tema (del sistema, oscuro, claro) y "Salir".

### Movimiento
Curva única ease-out-expo (`cubic-bezier(0.16, 1, 0.3, 1)`). Cambios de color del encendido y de las filas en 500ms; reordenamiento de filas en 450ms; capas superpuestas en 100-200ms. Con `prefers-reduced-motion: reduce` todas las animaciones y transiciones se reducen a 0.01ms y desaparecen el pulso, el gesto de pulsar y el layout animation.

## Do's and Don'ts

### Do:
- **Do** reservar signal, signal-fg y signal-soft para "abierto", "en sesión" y "aprobar".
- **Do** usar halt solo para lo destructivo y lo cerrado o deshabilitado, y wait para lo pendiente.
- **Do** poner los botones sin estado en tinta (primary), outline o ghost.
- **Do** escribir toda cifra o dato técnico en Geist Mono con tabular-nums.
- **Do** usar 16px de radio en superficies, filas, botones y campos, y pill para encendido, chips, filtros y días.
- **Do** mantener los pares de texto en AA en ambos temas: tinta sobre fondo (16:1 claro, 17:1 oscuro), muted-foreground sobre card (6.7:1 y 7.3:1), y cada color de estado sobre su tinte (4.9:1 o más).
- **Do** dar a cada control foco visible (contorno de 2px en ring con 2px de separación; 4px en el encendido), `aria-pressed` a los conmutadores y `aria-live="polite"` a los estados que cambian solos.
- **Do** actualizar filas en su sitio y resaltar el cambio hasta que se vea; nunca reordenar bajo el puntero.
- **Do** respetar `prefers-reduced-motion` en todo movimiento nuevo.

### Don't:
- **Don't** pintar de verde un botón común, un enlace o una acción que no sea aprobar.
- **Don't** construir el admin genérico: barra lateral, tabla gris o fila de tarjetas de KPI iguales.
- **Don't** usar sombras grises duras ni sombras de color sin un estado que las justifique.
- **Don't** usar Geist Mono para títulos, etiquetas o prosa.
- **Don't** mostrar nombres reales ni contenido de los logs; solo seudónimos y metadatos.
