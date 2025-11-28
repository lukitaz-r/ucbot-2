import mongoose, { Schema, Document } from 'mongoose';

export interface IWarning {
  fecha: number;
  autor: string;
  razon: string;
}

export interface IWarnings extends Document {
  guildID: string;
  userID: string;
  warnings: IWarning[];
}

const warningsSchema = new Schema<IWarnings>({
  guildID: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  warnings: {
    type: Array,
    default: [],
  } as any,
});

const model = mongoose.model<IWarnings>('warnings', warningsSchema);

export default model;
