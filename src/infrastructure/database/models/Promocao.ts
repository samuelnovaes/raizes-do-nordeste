import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IPromocao extends Document {
  nome: string;
  descricao: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO' | 'LEVE_PAGUE';
  valor: number;
  dataInicio: Date;
  dataFim: Date;
  unidadeId?: Types.ObjectId;
  produtoId?: Types.ObjectId;
  canalPedido?: 'APP' | 'TOTEM' | 'BALCAO' | 'PICKUP' | 'WEB';
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const PromocaoSchema = new Schema<IPromocao>({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  tipo: { type: String, enum: ['PERCENTUAL', 'VALOR_FIXO', 'LEVE_PAGUE'], required: true },
  valor: { type: Number, required: true },
  dataInicio: { type: Date, required: true },
  dataFim: { type: Date, required: true },
  unidadeId: { type: Schema.Types.ObjectId, ref: 'Unidade' },
  produtoId: { type: Schema.Types.ObjectId, ref: 'Produto' },
  canalPedido: { type: String, enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] },
  ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const Promocao = mongoose.model<IPromocao>('Promocao', PromocaoSchema);
