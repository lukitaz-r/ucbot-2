# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.0.2] - 2025-11-27

### Added
- Sistema de tipos TypeScript completo con interfaces personalizadas
- Archivo de configuración de ejemplo `config.json.example`
- Documentación de migración a TypeScript (`TYPESCRIPT_MIGRATION.md`)
- Source maps para debugging mejorado
- Configuración ESLint para TypeScript
- Scripts npm para desarrollo (`dev`, `watch`, `build`, `start`)

### Changed
- **Migración completa del proyecto de JavaScript a TypeScript**
  - Todos los archivos `.js` convertidos a `.ts`
  - Estructura de proyecto reorganizada en directorio `src/`
  - Código compilado ahora se genera en directorio `dist/`
- Comandos de música actualizados con tipado estricto
- Handlers de eventos refactorizados con tipos apropiados
- Modelos de Mongoose con interfaces TypeScript
- Configuración estricta de TypeScript habilitada

### Fixed
- Error de tipo en comando `/play` - `player` posiblemente undefined
- Error de propiedad en comando `/pause` - `requestedBy` posiblemente undefined
- Error de propiedad en comando `/resume` - `requestedBy` posiblemente undefined
- Error de tipo en comando `/help` - propiedad `slashCommandBuilder` no reconocida
- Error de canal en `index.ts` - método `send` en tipos de canal
- Manejo mejorado de null/undefined en toda la base de código
- Type safety mejorado en interacciones con Discord.js

### Security
- Archivo `config.json` añadido a `.gitignore` para prevenir exposición de credenciales
- Archivo `.env*` protegido en `.gitignore`
- Directorio `dist/` excluido del control de versiones

## [0.0.1] - 2025-11-XX

### Added
- Implementación inicial del bot en JavaScript
- Sistema de comandos modular
- Comandos de música usando MoonLink.js y Lavalink:
  - `/play` - Reproducir música
  - `/pause` - Pausar reproducción
  - `/resume` - Reanudar reproducción
  - `/skip` - Saltar canción
  - `/stop` - Detener reproducción
  - `/queue` - Ver cola de reproducción
- Comandos de información:
  - `/help` - Ayuda de comandos
  - `/ping` - Verificar latencia
- Sistema de eventos Discord.js
- Integración con MongoDB usando Mongoose
- Modelos de base de datos:
  - Configuración de servidores
  - Sistema de tickets
  - Sistema de sorteos
  - Sistema de advertencias
  - Sistema de votaciones y sugerencias
- Handler de comandos dinámico
- Handler de eventos
- Soporte para slash commands de Discord
- Sistema de desconexión automática por inactividad (30s)
- Licencia MIT

[0.0.2]: https://github.com/lukitaz-r/ucbot-2/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/lukitaz-r/ucbot-2/releases/tag/v0.0.1
