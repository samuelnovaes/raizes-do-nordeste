import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao';
import * as fidelidadeController from '../controllers/fidelidadeController';

const router = Router();

const esquemaResgate = z.object({
  pontos: z.number().int().positive(),
  descricao: z.string().min(1)
});

router.get('/pontos', autenticacao, autorizarPerfis('CLIENTE'), fidelidadeController.consultarPontos);
router.post('/resgate', autenticacao, autorizarPerfis('CLIENTE'), validacao(esquemaResgate), fidelidadeController.resgatar);

export { router as fidelidadeRoutes };
