import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao';
import * as pedidoController from '../controllers/pedidoController';

const router = Router();

const esquemaCriar = z.object({
  unidadeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Formato de ID inválido'),
  canalPedido: z.enum(['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB']),
  itens: z.array(z.object({
    produtoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Formato de ID inválido'),
    quantidade: z.number().int().positive()
  })).min(1),
  formaPagamento: z.string().min(1)
});

const esquemaStatus = z.object({
  status: z.enum(['PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'])
});

router.post('/', autenticacao, autorizarPerfis('CLIENTE'), validacao(esquemaCriar), pedidoController.criar);
router.get('/', autenticacao, pedidoController.listar);
router.get('/:id', autenticacao, pedidoController.buscar);
router.patch('/:id/status', autenticacao, autorizarPerfis('ATENDENTE', 'COZINHA', 'GERENTE'), validacao(esquemaStatus), pedidoController.atualizarStatus);

export { router as pedidoRoutes };
