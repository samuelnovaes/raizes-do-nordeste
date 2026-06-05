import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao';
import * as estoqueController from '../controllers/estoqueController';

const router = Router();

const esquemaMovimentacao = z.object({
  produtoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Formato de ID inválido'),
  unidadeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Formato de ID inválido'),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  quantidade: z.number().int().positive(),
  motivo: z.string().optional()
});

router.get('/:unidadeId', autenticacao, estoqueController.consultar);
router.post('/movimentacao', autenticacao, autorizarPerfis('GERENTE', 'ATENDENTE'), validacao(esquemaMovimentacao), estoqueController.registrarMovimentacao);

export { router as estoqueRoutes };
