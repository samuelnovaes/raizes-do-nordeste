import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IPagamento extends Document {
  pedidoId: Types.ObjectId;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  valor: number;
  metodo: string;
  transacaoId?: string;
  respostaMock?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const PagamentoSchema = new Schema<IPagamento>({
  pedidoId: { type: Schema.Types.ObjectId, ref: 'Pedido', required: true, unique: true },
  status: { type: String, enum: ['PENDENTE', 'APROVADO', 'RECUSADO'], default: 'PENDENTE' },
  valor: { type: Number, required: true },
  metodo: { type: String, required: true },
  transacaoId: { type: String },
  respostaMock: { type: String }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const Pagamento = mongoose.model<IPagamento>('Pagamento', PagamentoSchema);
