import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IFidelidade extends Document {
  usuarioId: Types.ObjectId;
  pontos: number;
  consentimento: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const FidelidadeSchema = new Schema<IFidelidade>({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  pontos: { type: Number, default: 0 },
  consentimento: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const Fidelidade = mongoose.model<IFidelidade>('Fidelidade', FidelidadeSchema);
