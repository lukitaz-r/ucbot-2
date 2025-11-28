import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  guildID: string;
  autor: string;
  canal: string;
  cerrado: boolean;
}

const ticketsSchema = new Schema<ITicket>({
  guildID: { type: String, required: true },
  autor: { type: String, required: true },
  canal: { type: String, required: true },
  cerrado: { type: Boolean, default: false },
});

const model = mongoose.model<ITicket>('Tickets_Creados', ticketsSchema);

export default model;
