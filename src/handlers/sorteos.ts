import { ExtendedClient } from '../types';
import { ColorResolvable } from 'discord.js';
import { GiveawaysManager } from 'discord-giveaways';
import sorteosSchema from '../models/sorteos';

export default async (client: ExtendedClient) => {
  //obtenemos la base de los sorteos pero si no existe la creamos.
  let db = await sorteosSchema.findOne({ ID: "sorteos" });
  if (!db) {
    db = new sorteosSchema({ ID: "sorteos", data: [] });
    await db.save();
  }

  //creamos nuestro propio constructor de sistemas de sorteos usando mongoDB
  class SorteosConMongoDB extends GiveawaysManager {

    async getAllGiveaways() {
      //obtenemos la base de los sorteos y devolvemos el array de los datos del sorteo haciendo return;
      const db = await sorteosSchema.findOne({ ID: "sorteos" });
      return db?.data || [];
    }

    async saveGiveaway(datoSorteo: any) {
      //empujamos el sorteo en el array de sorteos
      await sorteosSchema.findOneAndUpdate({ ID: "sorteos" }, {
        $push: {
          data: datoSorteo
        }
      });
      return true;
    }

    async editGiveaway(messageID: string, datoSorteo: any) {
      //obtenemos la db de los sorteos
      const db = await sorteosSchema.findOne({ ID: "sorteos" });
      if (!db) return false;
      const sorteos = db.data;

      let sorteoIndex = -1;
      //buscamos el index del sorteo haciendo un mapeado de los sorteos y filtrando
      sorteos.forEach((sorteo: any, index: number) => {
        if (sorteo.messageId && sorteo.messageId.includes(messageID)) {
          sorteoIndex = index;
        }
      });
      //si el index es > -1, significa que se ha encontrado el sorteo
      if (sorteoIndex > -1) {
        db.data[sorteoIndex] = datoSorteo;
        await sorteosSchema.findOneAndUpdate({ ID: "sorteos" }, db);
        return true;
      }
      return false;
    }

    async deleteGiveaway(messageID: string) {
      //obtenemos la db de los sorteos
      const db = await sorteosSchema.findOne({ ID: "sorteos" });
      if (!db) return false;
      const sorteos = db.data;
      let sorteoIndex = -1;
      //buscamos el index del sorteo haciendo un mapeado de los sorteos y filtrando
      sorteos.forEach((sorteo: any, index: number) => {
        if (sorteo.messageId && sorteo.messageId.includes(messageID)) {
          sorteoIndex = index;
        }
      });
      //si el index es > -1, significa que se ha encontrado el sorteo
      if (sorteoIndex > -1) {
        db.data.splice(sorteoIndex, 1);
        await sorteosSchema.findOneAndUpdate({ ID: "sorteos" }, db);
        return true;
      }
      return false;
    }
  }

  //crear sistema de sorteos
  //crear sistema de sorteos
  client.giveawaysManager = new SorteosConMongoDB(client, {
    default: {
      botsCanWin: false,
      embedColor: client.color as ColorResolvable,
      embedColorEnd: "#000000",
      reaction: "🎉"
    }
  });
}
