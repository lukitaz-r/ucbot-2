# 🤖 UCBot-2

Bot multifuncional de Discord desarrollado en TypeScript para la comunidad **El Último Círculo**. Incluye sistema de música, comandos de información y soporte para múltiples funcionalidades de servidor.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.22.1-5865F2.svg)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Características

- 🎵 **Sistema de Música**: Reproducción de música con MoonLink.js y Lavalink
- 📊 **Base de Datos**: Integración con MongoDB para persistencia de datos
- 🔧 **Modular**: Arquitectura de comandos y eventos fácilmente extensible
- 📝 **TypeScript**: Código type-safe con configuración estricta
- ⚡ **Slash Commands**: Soporte completo para comandos de barra de Discord

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) v16.0.0 o superior
- [MongoDB](https://www.mongodb.com/) (local o Atlas)
- [Lavalink](https://github.com/lavalink-devs/Lavalink) (opcional, solo para música)
- Bot de Discord con token (crear en [Discord Developer Portal](https://discord.com/developers/applications))

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/lukitaz-r/ucbot-2.git
cd ucbot-2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el bot

Crea el archivo de configuración basándote en el ejemplo:

```bash
cp config/config.json.example config/config.json
```

Edita `config/config.json` con tus credenciales:

```json
{
  "token": "TU_TOKEN_DE_DISCORD_AQUI",
  "mongoUri": "mongodb://localhost:27017/ucbot",
  "lavalink": {
    "active": true,
    "host": "localhost",
    "port": 2333,
    "password": "youshallnotpass",
    "secure": false
  }
}
```

#### Obtener el Token de Discord:

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación o selecciona una existente
3. Ve a la sección **Bot**
4. Copia el token (haz clic en "Reset Token" si es necesario)
5. Activa los **Privileged Gateway Intents**:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent

#### Configurar MongoDB:

**Opción A - MongoDB Local:**
```bash
# Instala MongoDB localmente y usa:
"mongoUri": "mongodb://localhost:27017/ucbot"
```

**Opción B - MongoDB Atlas (Cloud):**
```bash
# Crea un cluster gratuito en https://www.mongodb.com/cloud/atlas
"mongoUri": "mongodb+srv://usuario:password@cluster.mongodb.net/ucbot"
```

#### Configurar Lavalink (Opcional - Solo para Música):

Si deseas usar los comandos de música, necesitas Lavalink:

1. Descarga Lavalink desde [GitHub](https://github.com/lavalink-devs/Lavalink/releases)
2. Ejecuta el servidor Lavalink
3. Configura los valores en `config.json` según tu servidor Lavalink

Si **NO** quieres usar música, establece `"active": false` en la sección lavalink.

### 4. Ejecutar el bot

```bash
npm run start
```

## 🎮 Uso

### Modo Desarrollo

Ejecuta el bot con recarga automática:

```bash
npm run start
```

### Modo Producción

Compila y ejecuta el bot:

```bash
npm run start
```

### Otros Scripts

```bash
npm run start    # Ejecuta el bot
```

## 📂 Estructura del Proyecto

```
ucbot-2/
├── src/                      # Código fuente TypeScript
│   ├── commands/             # Comandos del bot
│   │   ├── Info/            # Comandos de información
│   │   │   ├── help.ts      # Comando de ayuda
│   │   │   └── ping.ts      # Comando de ping
│   │   └── Musica/          # Comandos de música
│   │       ├── play.ts      # Reproducir música
│   │       ├── pause.ts     # Pausar música
│   │       ├── resume.ts    # Reanudar música
│   │       ├── skip.ts      # Saltar canción
│   │       ├── stop.ts      # Detener música
│   │       └── queue.ts     # Ver cola
│   ├── events/              # Eventos del bot
│   │   ├── client/          # Eventos del cliente
│   │   │   └── clientReady.ts
│   │   └── server/          # Eventos del servidor
│   │       ├── interactionCreate.ts
│   │       └── messageCreate.ts
│   ├── handlers/            # Manejadores
│   │   ├── command.ts       # Handler de comandos
│   │   └── events.ts        # Handler de eventos
│   ├── models/              # Modelos de MongoDB
│   │   ├── servidor.ts      # Configuración de servidor
│   │   ├── setups.ts        # Configuraciones generales
│   │   ├── tickets.ts       # Sistema de tickets
│   │   ├── sorteos.ts       # Sistema de sorteos
│   │   ├── warns.ts         # Sistema de advertencias
│   │   └── votos-sugs.ts    # Votaciones y sugerencias
│   ├── types/               # Definiciones de tipos
│   │   └── index.ts         # Tipos TypeScript
│   ├── utils/               # Utilidades
│   │   ├── funciones.ts     # Funciones auxiliares
│   │   └── music.ts         # Utilidades de música
│   └── index.ts             # Punto de entrada principal
├── dist/                     # Código compilado (generado)
├── config/                   # Archivos de configuración
│   ├── config.json          # Configuración (no incluido en git)
│   └── config.json.example  # Plantilla de configuración
├── tsconfig.json            # Configuración de TypeScript
├── package.json             # Dependencias y scripts
├── CHANGELOG.md             # Registro de cambios
├── TYPESCRIPT_MIGRATION.md  # Documentación de migración
└── README.md                # Este archivo
```

## 🎵 Comandos Disponibles

### Comandos de Música

| Comando | Descripción |
|---------|-------------|
| `/play <canción/url>` | Reproduce una canción desde YouTube, Spotify u otras fuentes |
| `/pause` | Pausa la reproducción actual |
| `/resume` | Reanuda la reproducción pausada |
| `/skip` | Salta a la siguiente canción en la cola |
| `/stop` | Detiene la música y limpia la cola |
| `/queue` | Muestra la cola de reproducción actual |

### Comandos de Información

| Comando | Descripción |
|---------|-------------|
| `/help` | Muestra información de ayuda sobre los comandos |
| `/ping` | Verifica la latencia del bot |

## 🛠️ Tecnologías Utilizadas

- **[TypeScript](https://www.typescriptlang.org/)** - Lenguaje de programación con tipado estático
- **[Discord.js v14](https://discord.js.org/)** - Librería para interactuar con la API de Discord
- **[MoonLink.js](https://github.com/Ecliptia/moonlink.js)** - Wrapper de Lavalink para Node.js
- **[Mongoose](https://mongoosejs.com/)** - ODM para MongoDB
- **[MongoDB](https://www.mongodb.com/)** - Base de datos NoSQL
- **[Lavalink](https://github.com/lavalink-devs/Lavalink)** - Servidor de audio para Discord

## 📝 Desarrollo

### Añadir un nuevo comando

1. Crea un archivo `.ts` en `src/commands/<Categoría>/`
2. Define el comando usando la interfaz `Command`:

```typescript
import { Command } from '../../types';

const command: Command = {
  name: 'micomando',
  description: 'Descripción del comando',
  aliases: ['alias1', 'alias2'],
  async execute(client, interaction) {
    // Lógica del comando
    await interaction.reply('¡Hola!');
  }
};

export = command;
```

4. Corre el bot con `npm run start`
3. El handler cargará automáticamente el nuevo comando

### Añadir un nuevo evento

1. Crea un archivo `.ts` en `src/events/<client|server>/`
2. Exporta el evento con `name` y `execute`:

```typescript
import { Events } from 'discord.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    // Lógica del evento
  }
};
```

## 🐛 Solución de Problemas

### El bot no se conecta

- Verifica que el token en `config.json` sea correcto
- Asegúrate de haber activado los **Privileged Gateway Intents** en el Developer Portal

### Los comandos no aparecen

- Espera unos minutos, los slash commands pueden tardar en propagarse
- Verifica que tengas los permisos `applications.commands` en el bot

### La música no funciona

- Verifica que Lavalink esté ejecutándose
- Comprueba la configuración de Lavalink en `config.json` y `config`
- Si no usas música, establece `"active": false` en la configuración de Lavalink

### Errores de MongoDB

- Verifica que MongoDB esté ejecutándose
- Comprueba la URI de conexión en `config.json`
- Asegúrate de que la base de datos sea accesible

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Luca Ramirez** ([@lukitaz_r](https://github.com/lukitaz-r))

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📚 Recursos

- [Documentación de Discord.js](https://discord.js.org/#/docs/)
- [Guía de Discord.js](https://discordjs.guide/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Mongoose con TypeScript](https://mongoosejs.com/docs/typescript.html)
- [Lavalink Documentation](https://lavalink.dev/)

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub!
