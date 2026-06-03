import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao';
import * as promocaoController from '../controllers/promocaoController';

const router = Router();

const esquemaCriar = z.object({
  nome: z.string().min(2),
  descricao: z.string().min(1),
  tipo: z.enum(['PERCENTUAL', 'VALOR_FIXO', 'LEVE_PAGUE']),
  valor: z.number().positive(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  unidadeId: z.string().optional(),
  produtoId: z.string().optional(),
  canalPedido: z.enum(['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB']).optional(),
  ativo: z.boolean().optional()
});

const esquemaAtualizar = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().min(1).optional(),
  tipo: z.enum(['PERCENTUAL', 'VALOR_FIXO', 'LEVE_PAGUE']).optional(),
  valor: z.number().positive().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  unidadeId: z.string().optional(),
  produtoId: z.string().optional(),
  canalPedido: z.enum(['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB']).optional(),
  ativo: z.boolean().optional()
});

// Listar promoções ativas
router.get('/', promocaoController.listar);

// Buscar promoção por ID
router.get('/:id', promocaoController.buscar);

// Criar promoção/campanha (GERENTE/ADMIN)
router.post('/', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaCriar), promocaoController.criar);

// Atualizar promoção (GERENTE/ADMIN)
router.put('/:id', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaAtualizar), promocaoController.atualizar);

// Desativar promoção (GERENTE/ADMIN)
router.patch('/:id/desativar', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), promocaoController.desativar);

export { router as promocaoRoutes };
