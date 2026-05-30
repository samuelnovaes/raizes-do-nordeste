import mongoose, { Schema, type Document } from 'mongoose';

export interface IUnidade extends Document {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  ativa: boolean;
  criadoEm: Date;
}

const UnidadeSchema = new Schema<IUnidade>({
  nome: { type: String, required: true },
  endereco: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true },
  ativa: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: false } });

export const Unidade = mongoose.model<IUnidade>('Unidade', UnidadeSchema);
