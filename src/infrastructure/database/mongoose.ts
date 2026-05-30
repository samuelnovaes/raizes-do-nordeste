import mongoose from 'mongoose';

export async function conectarMongoDB(): Promise<void> {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/raizes_nordeste';

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(uri);
  console.log('Conectado ao MongoDB');
}

export async function desconectarMongoDB(): Promise<void> {
  await mongoose.disconnect();
}

export { mongoose };
