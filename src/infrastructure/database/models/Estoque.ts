import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IEstoque extends Document {
  produtoId: Types.ObjectId;
  unidadeId: Types.ObjectId;
  quantidade: number;
}

const EstoqueSchema = new Schema<IEstoque>({
  produtoId: { type: Schema.Types.ObjectId, ref: 'Produto', required: true },
  unidadeId: { type: Schema.Types.ObjectId, ref: 'Unidade', required: true },
  quantidade: { type: Number, default: 0 }
});

EstoqueSchema.index({ produtoId: 1, unidadeId: 1 }, { unique: true });

export const Estoque = mongoose.model<IEstoque>('Estoque', EstoqueSchema);
