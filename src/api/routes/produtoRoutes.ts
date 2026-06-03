import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao';
import * as produtoController from '../controllers/produtoController';

const router = Router();

const esquemaCriar = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  preco: z.number().positive(),
  categoria: z.string().optional(),
  imagem: z.string().url().optional()
});

const esquemaAtualizar = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  preco: z.number().positive().optional(),
  categoria: z.string().optional(),
  imagem: z.string().url().optional()
});

router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscar);
router.get('/cardapio/:unidadeId', produtoController.cardapioPorUnidade);
router.post('/', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaCriar), produtoController.criar);
router.put('/:id', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaAtualizar), produtoController.atualizar);

export { router as produtoRoutes };
