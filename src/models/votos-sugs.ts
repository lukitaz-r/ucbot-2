import mongoose, { Schema, Document } from 'mongoose';

export interface IVotosSugerencias extends Document {
  messageID: string;
  si: string[];
  no: string[];
  autor: string;
}

const votosSugerenciasSchema = new Schema<IVotosSugerencias>({
  messageID: { type: String, required: true },
  si: { type: [String], default: [] },
  no: { type: [String], default: [] },
  autor: { type: String, default: '' },
});

const model = mongoose.model<IVotosSugerencias>('votos_sugerencias', votosSugerenciasSchema);

export default model;
