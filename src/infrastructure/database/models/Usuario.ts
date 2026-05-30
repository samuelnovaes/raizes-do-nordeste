import mongoose, { Schema, type Document } from 'mongoose';

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  telefone?: string;
  perfil: 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'COZINHA' | 'CLIENTE';
  consentimentoLgpd: boolean;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cpf: { type: String, unique: true, sparse: true },
  telefone: { type: String },
  perfil: { type: String, enum: ['ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE'], default: 'CLIENTE' },
  consentimentoLgpd: { type: Boolean, default: false },
  ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
