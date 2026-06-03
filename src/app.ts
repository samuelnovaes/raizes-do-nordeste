import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { erroHandler } from './api/middlewares/erroHandler';
import { router } from './api/routes';
import { swaggerSpec } from './api/docs/swaggerConfig';

const app = express();

// Middlewares globais
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Documentação Swagger
app.get('/docs/swagger.json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.get('/saude', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', router);

// Tratamento de erros
app.use(erroHandler);

export { app };
