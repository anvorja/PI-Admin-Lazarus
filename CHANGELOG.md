# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
[versionado semántico](https://semver.org/lang/es/). Cada versión corresponde a una
release del Release Plan de Lazarus.

## [0.2.0] — 2026-10-29 · R1: piloto técnico listo para campo

Primera versión de la consola de administración del piloto, publicada en Netlify y
usada en las jornadas de campo del 17, 24, 27 y 28 de octubre.

### Teléfonos y servicio
- Acceso con usuario de administrador y sesión con renovación.
- Lista de teléfonos para aprobar, deshabilitar o eliminar, con horario de uso, límite
  de minutos y cierre remoto de la sesión (HU-044).
- Pausa del servicio y estado de cada teléfono, con latencia mediana, operador y tipo de
  red de cada sesión (HU-043, HU-047).
- Logs de campo de cada teléfono: descarga en .zip y limpieza (HU-045).
- Capacidad del servidor: CPU, memoria, sesiones y tráfico (HU-047).

### Rutas curadas
- Cargar, validar, descargar y eliminar perfiles de ruta.
- Editor visual de rutas:
  - pasos y puntos sobre un mapa;
  - notas de campo y recorrido GPS de cada teléfono;
  - avisos de puntos muy cercanos y giros sin indicación.
- Guía paso a paso dentro del editor, también en el teléfono, con barra fija y hoja
  inferior.

### Entrega
- Integración continua: lint y build.
- `main` se publica en Netlify. El proxy `/api/*` hacia el backend se configura con la
  variable `BACKEND_URL` del sitio.

[0.2.0]: https://github.com/anvorja/PI-Admin-Lazarus/releases/tag/v0.2.0
