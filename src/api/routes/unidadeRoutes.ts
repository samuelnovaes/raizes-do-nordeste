import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao.ts';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao.ts';
import * as unidadeController from '../controllers/unidadeController.ts';

const router = Router();

const esquemaCriar = z.object({
  nome: z.string().min(2),
  endereco: z.string().min(5),
  cidade: z.string().min(2),
  estado: z.string().length(2)
});

const esquemaAtualizar = z.object({
  nome: z.string().min(2).optional(),
  endereco: z.string().min(5).optional(),
  cidade: z.string().min(2).optional(),
  estado: z.string().length(2).optional()
});

router.get('/', unidadeController.listar);
router.get('/:id', unidadeController.buscar);
router.post('/', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaCriar), unidadeController.criar);
router.put('/:id', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaAtualizar), unidadeController.atualizar);

export { router as unidadeRoutes };
