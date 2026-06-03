import 'dotenv/config';
import { app } from './app';
import { conectarMongoDB } from './infrastructure/database/mongoose';

const porta = Number(process.env.PORT) || 3000;

conectarMongoDB().then(() => {
  app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
  });
}).catch((err) => {
  console.error('Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});
