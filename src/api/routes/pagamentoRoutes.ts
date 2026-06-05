import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao } from '../middlewares/autenticacao';
import * as pagamentoController from '../controllers/pagamentoController';

const router = Router();

const esquemaPagamento = z.object({
  pedidoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Formato de ID inválido'),
  metodo: z.string().min(1)
});

router.post('/', autenticacao, validacao(esquemaPagamento), pagamentoController.processar);

export { router as pagamentoRoutes };
