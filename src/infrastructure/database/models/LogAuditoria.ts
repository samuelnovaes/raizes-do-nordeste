import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ILogAuditoria extends Document {
  usuarioId?: Types.ObjectId;
  acao: string;
  entidade: string;
  entidadeId?: string;
  detalhes?: string;
  ip?: string;
  criadoEm: Date;
}

const LogAuditoriaSchema = new Schema<ILogAuditoria>({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  acao: { type: String, required: true },
  entidade: { type: String, required: true },
  entidadeId: { type: String },
  detalhes: { type: String },
  ip: { type: String }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: false } });

export const LogAuditoria = mongoose.model<ILogAuditoria>('LogAuditoria', LogAuditoriaSchema);
