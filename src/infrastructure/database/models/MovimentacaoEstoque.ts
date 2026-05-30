import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IMovimentacaoEstoque extends Document {
  estoqueId: Types.ObjectId;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  motivo?: string;
  criadoEm: Date;
}

const MovimentacaoEstoqueSchema = new Schema<IMovimentacaoEstoque>({
  estoqueId: { type: Schema.Types.ObjectId, ref: 'Estoque', required: true },
  tipo: { type: String, enum: ['ENTRADA', 'SAIDA'], required: true },
  quantidade: { type: Number, required: true },
  motivo: { type: String }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: false } });

export const MovimentacaoEstoque = mongoose.model<IMovimentacaoEstoque>('MovimentacaoEstoque', MovimentacaoEstoqueSchema);
