import mongoose, { Schema, Document } from 'mongoose';

export interface ISorteo extends Document {
  ID: string;
  data: any[];
}

const sorteoSchema = new Schema<ISorteo>({
  ID: { type: String, default: 'sorteos' },
  data: { type: Array, default: [] } as any,
});

const model = mongoose.model<ISorteo>('sorteos', sorteoSchema);

export default model;
