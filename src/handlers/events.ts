import { readdirSync } from 'fs';
import { join } from 'path';
import { ExtendedClient } from '../types';
import 'colors';

interface EventModule {
  name: string;
  once?: boolean;
  run: (client: ExtendedClient, ...args: any[]) => void | Promise<void>;
}

// Lista para almacenar nombres de eventos cargados
const allEvents: string[] = [];

export default async (client: ExtendedClient): Promise<void> => {
  console.log('🔄 Cargando los eventos...'.yellow);
  let count = 0;

  const loadDir = (folder: string): void => {
    const dirPath = join(__dirname, '..', 'events', folder);
    const files = readdirSync(dirPath).filter((f) => f.endsWith('.js') || f.endsWith('.ts'));

    for (const file of files) {
      try {
        const eventModule: EventModule = require(join(dirPath, file));

        allEvents.push(eventModule.name);
        if (eventModule.once) {
          client.once(eventModule.name, (...args: any[]) => {
            eventModule.run(client, ...args);
          });
        } else {
          client.on(eventModule.name, (...args: any[]) => {
            eventModule.run(client, ...args);
          });
        }

        count++;
      } catch (error) {
        console.error(`Error cargando evento ${file}:`.red, error);
      }
    }
  };

  ['client', 'server'].forEach(loadDir);

  console.log(`✅ ${count} eventos cargados:`.green, allEvents.join(', ').blue);
  console.log('🔄 Iniciando Sesión el Bot...'.yellow);
};
