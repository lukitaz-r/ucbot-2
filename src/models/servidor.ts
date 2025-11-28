import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document {
  guildID: string;
  prefijo: string;
  premium: string;
  idioma: string;
}

const serverSchema = new Schema<IServer>({
  guildID: { type: String, required: true },
  prefijo: { type: String, required: true },
  premium: { type: String, default: '' },
  idioma: { type: String, default: 'es' },
});

const model = mongoose.model<IServer>('ConfigServer', serverSchema);

export default model;
