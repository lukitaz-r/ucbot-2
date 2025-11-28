# UCBot-2 - Migración a TypeScript

## 📋 Resumen de la Migración

Este proyecto ha sido completamente refactorizado de JavaScript a TypeScript para mejorar la seguridad de tipos, mantenibilidad y experiencia de desarrollo.

## 🗂️ Estructura del Proyecto

```
ucbot-2/
├── src/                    # Código fuente TypeScript
│   ├── commands/          # Comandos del bot
│   │   ├── Info/         # Comandos de información
│   │   └── Musica/       # Comandos de música
│   ├── events/           # Eventos del bot
│   │   ├── client/       # Eventos del cliente
│   │   └── server/       # Eventos del servidor
│   ├── handlers/         # Manejadores de comandos y eventos
│   ├── models/           # Modelos de Mongoose
│   ├── types/            # Definiciones de tipos TypeScript
│   ├── utils/            # Utilidades
│   └── index.ts          # Punto de entrada principal
├── dist/                  # Código compilado (generado)
├── config/               # Archivos de configuración
├── tsconfig.json         # Configuración de TypeScript
└── package.json          # Dependencias y scripts
```

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Ejecuta el bot en modo desarrollo con ts-node
npm run watch        # Compila TypeScript en modo watch
```

### Producción
```bash
npm run build        # Compila TypeScript a JavaScript
npm start            # Ejecuta el bot compilado
npm test             # Compila y ejecuta el bot
```

## 📦 Nuevas Dependencias

### Dependencias de Desarrollo
- `typescript` - Compilador de TypeScript
- `ts-node` - Ejecutor de TypeScript para desarrollo
- `@types/node` - Tipos de Node.js
- `@types/mongoose` - Tipos de Mongoose

## 🔧 Configuración de TypeScript

El archivo `tsconfig.json` está configurado con:
- **Modo estricto** activado para máxima seguridad de tipos
- **Target**: ES2022
- **Module**: CommonJS (compatible con el código existente)
- **Source Maps** habilitados para debugging
- **Salida**: `dist/` directory

## 📝 Cambios Principales

### 1. Sistema de Tipos
- Creado `src/types/index.ts` con interfaces para:
  - `ExtendedClient` - Cliente extendido de Discord.js
  - `Command` - Estructura de comandos
  - `BotConfig` - Configuración del bot
  - `EmbedConfig` - Configuración de embeds

### 2. Modelos de Mongoose
Todos los modelos ahora tienen interfaces TypeScript:
- `IServer` - Configuración del servidor
- `ISetup` - Configuraciones generales
- `IWarnings` - Sistema de advertencias
- `ITicket` - Sistema de tickets
- `ISorteo` - Sistema de sorteos
- `IVotosSugerencias` - Sistema de votaciones

### 3. Comandos
Todos los comandos convertidos con tipos completos:
- Parámetros tipados
- Retornos de tipo `Promise<void>`
- Manejo de errores mejorado

### 4. Eventos
Eventos convertidos con tipos específicos:
- `clientReady` - Inicialización del bot
- `interactionCreate` - Manejo de interacciones
- `messageCreate` - Manejo de mensajes

### 5. Utilidades
- `music.ts` - Funciones de música con tipos
- `funciones.ts` - Utilidades generales con tipos

## 🔄 Migración de Archivos Antiguos

Los archivos JavaScript originales permanecen en sus ubicaciones originales. Para completar la migración:

1. **Verifica que todo funciona**:
   ```bash
   npm run build
   npm start
   ```

2. **Una vez confirmado, puedes eliminar los archivos JS antiguos**:
   - `index.js`
   - `commands/**/*.js`
   - `events/**/*.js`
   - `handlers/**/*.js`
   - `models/**/*.js`
   - `utils/**/*.js`

3. **Actualiza `.gitignore`** para incluir:
   ```
   dist/
   *.js
   !eslint.config.js
   ```

## ⚠️ Notas Importantes

1. **Configuración**: El archivo `config/config.json` debe existir con la estructura correcta
2. **MongoDB**: Asegúrate de tener la conexión a MongoDB configurada
3. **Lavalink**: Si usas el sistema de música, configura Lavalink correctamente
4. **Node.js**: Requiere Node.js 16+ para ES2022

## 🐛 Debugging

Para debugging con source maps:
```bash
npm run build
node --inspect dist/index.js
```

## 📚 Recursos

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Discord.js Guide](https://discordjs.guide/)
- [Mongoose TypeScript](https://mongoosejs.com/docs/typescript.html)

## 👨‍💻 Desarrollo

Para añadir nuevos comandos o eventos:
1. Crea el archivo `.ts` en la carpeta correspondiente en `src/`
2. Importa los tipos necesarios de `src/types`
3. Exporta el módulo usando `export =` para compatibilidad con CommonJS
4. Compila con `npm run build`

## 🎯 Próximos Pasos

1. Convertir los handlers restantes (sorteos, tickets, sugerencias, reacción_roles)
2. Añadir tests unitarios con Jest
3. Configurar CI/CD para validación de tipos
4. Migrar a ES Modules si es necesario
