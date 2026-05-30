import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IItemPedido {
  produtoId: Types.ObjectId;
  quantidade: number;
  precoUnitario: number;
}

export interface IPedido extends Document {
  usuarioId: Types.ObjectId;
  unidadeId: Types.ObjectId;
  canalPedido: 'APP' | 'TOTEM' | 'BALCAO' | 'PICKUP' | 'WEB';
  status: 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'EM_PREPARO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
  total: number;
  formaPagamento: string;
  itens: IItemPedido[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const ItemPedidoSchema = new Schema<IItemPedido>({
  produtoId: { type: Schema.Types.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: true },
  precoUnitario: { type: Number, required: true }
}, { _id: true });

const PedidoSchema = new Schema<IPedido>({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  unidadeId: { type: Schema.Types.ObjectId, ref: 'Unidade', required: true },
  canalPedido: { type: String, enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'], required: true },
  status: { type: String, enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'], default: 'AGUARDANDO_PAGAMENTO' },
  total: { type: Number, required: true },
  formaPagamento: { type: String, required: true },
  itens: [ItemPedidoSchema]
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const Pedido = mongoose.model<IPedido>('Pedido', PedidoSchema);
