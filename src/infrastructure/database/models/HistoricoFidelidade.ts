import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IHistoricoFidelidade extends Document {
  fidelidadeId: Types.ObjectId;
  pontos: number;
  tipo: string;
  descricao?: string;
  criadoEm: Date;
}

const HistoricoFidelidadeSchema = new Schema<IHistoricoFidelidade>({
  fidelidadeId: { type: Schema.Types.ObjectId, ref: 'Fidelidade', required: true },
  pontos: { type: Number, required: true },
  tipo: { type: String, required: true },
  descricao: { type: String }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: false } });

export const HistoricoFidelidade = mongoose.model<IHistoricoFidelidade>('HistoricoFidelidade', HistoricoFidelidadeSchema);
