import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao.ts';
import { autenticacao } from '../middlewares/autenticacao.ts';
import * as pagamentoController from '../controllers/pagamentoController.ts';

const router = Router();

const esquemaPagamento = z.object({
  pedidoId: z.string().uuid(),
  metodo: z.string().min(1)
});

router.post('/', autenticacao, validacao(esquemaPagamento), pagamentoController.processar);

export { router as pagamentoRoutes };
