import mongoose, { Schema, type Document } from 'mongoose';

export interface ICategoria extends Document {
  nome: string;
}

const CategoriaSchema = new Schema<ICategoria>({
  nome: { type: String, required: true, unique: true }
});

export const Categoria = mongoose.model<ICategoria>('Categoria', CategoriaSchema);
