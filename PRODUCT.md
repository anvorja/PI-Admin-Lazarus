# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un solo administrador: el coordinador de las pruebas de campo de Lazarus (desarrollador y responsable del piloto). Lo usa en el computador, en casa, y en el celular durante las jornadas de campo en las estaciones del MIO y en la Universidad del Valle, a veces de pie, con prisa y con datos móviles.

## Product Purpose

Panel de administración del piloto de Lazarus, un asistente de voz con cámara para personas ciegas que recorren rutas entre estaciones del MIO y la Universidad del Valle (Cali). Permite controlar quién usa la app, cuándo y cuánto, porque cada sesión consume saldo del servicio de IA, y recoger los registros de campo que los participantes generan con sus teléfonos. Éxito: el coordinador abre o cierra el servicio, aprueba un teléfono nuevo o corta una sesión en segundos, y descarga los logs de cada participante sin cable.

## Positioning

Es la consola de operación de un piloto real con participantes ciegos, no un dashboard genérico: el estado que importa es binario y urgente (¿está gastando saldo ahora?, ¿quién está en sesión?), y cada acción tiene consecuencias para una persona que está caminando por la calle con la app.

## Operating Context

- Los participantes reciben el APK por WhatsApp y recorren sus rutas con un acompañante, etiquetando puntos con "anota que…". Fuera de las jornadas el servicio debe estar cerrado.
- Cada teléfono se registra solo la primera vez y aparece pendiente; el coordinador lo aprueba y le pone un seudónimo (nunca el nombre real).
- Interruptor de emergencia aparte: LIVE_ENABLED en Render manda sobre el panel.
- Backend: FastAPI en Render (`/api/v1/admin/*`). El panel se publica en Netlify con un proxy de `/api/*` al backend (mismo origen para el navegador).

## Capabilities and Constraints

- Servicio: abrir o cerrar; horario de las jornadas (días y horas, hora de Colombia); estado "abierto ahora" calculado por el backend.
- Dispositivos: estado (pendiente, aprobado, deshabilitado), modelo, Android, versión de la app, última conexión e IP, minutos usados hoy, límite diario, en sesión o no, subidas de logs.
- Acciones: aprobar, deshabilitar, renombrar (seudónimo), límite diario de minutos (0 = sin límite), pedir logs, cerrar la sesión activa, borrar.
- Detalle: latencia voz a voz (mediana, p90), archivos de logs y descarga .zip, últimas sesiones con duración, código de cierre e IP.
- Sesión del administrador: JWT de acceso de 15 minutos en memoria y refresh en cookie HttpOnly; al recargar se renueva sola.
- Stack fijado: React 19, TypeScript estricto (tipado obligatorio), Tailwind 4, shadcn, TanStack (Query y Router/Table), patrón Context + Provider + Hook del manual `Hooks - manual.pdf` (contexts/, providers/, hooks/).
- Todo el texto en español (Colombia).

## Brand Commitments

- Nombre: Lazarus. Ícono de la app sobre fondo negro (activo de marca en `SCRUM-Lazarus/marca/` del repo de documentación).
- Referencia visual pedida por el usuario: las webs modernas de servicios VPN (por ejemplo, el prototipo de PrivateVPN en Dribbble): el estado de conexión como protagonista, tarjetas limpias, modo oscuro.

## Evidence on Hand

- Datos reales: teléfonos de los participantes del piloto (Xiaomi 23117RA68G, Samsung SM-A266M, Xiaomi 2312DRA50G, Redmi del coordinador). No hay métricas de negocio ni testimonios; no inventarlos.
- Los datos de los participantes (voz transcrita y ubicaciones) son sensibles y con consentimiento firmado: el panel no muestra contenido de los logs, solo metadatos y la descarga.

## Product Principles

1. El estado primero: abierto o cerrado, quién está en sesión y quién espera aprobación se ve sin buscar.
2. Acciones con consecuencia se confirman o se pueden revertir; borrar siempre pide confirmación.
3. Funciona igual en el celular en la estación que en el escritorio.
4. Seudónimos y metadatos: nunca nombres reales ni contenido de los logs en pantalla.

## Accessibility & Inclusion

WCAG 2.2 AA: contraste, foco visible, navegación por teclado y etiquetas en todos los controles. El coordinador trabaja con personas ciegas; el panel debe ser usable con lector de pantalla.
