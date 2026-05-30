import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IProduto extends Document {
  nome: string;
  descricao?: string;
  preco: number;
  categoriaId: Types.ObjectId;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const ProdutoSchema = new Schema<IProduto>({
  nome: { type: String, required: true },
  descricao: { type: String },
  preco: { type: Number, required: true },
  categoriaId: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
  ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const Produto = mongoose.model<IProduto>('Produto', ProdutoSchema);
