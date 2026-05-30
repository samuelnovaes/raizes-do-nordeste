import type { Request, Response, NextFunction } from 'express';
import * as pagamentoService from '../../application/services/pagamentoService.ts';

// Processa pagamento de um pedido
export async function processar(req: Request, res: Response, next: NextFunction) {
  try {
    const { pedidoId, metodo } = req.body;
    const pagamento = await pagamentoService.processarPagamento(pedidoId, metodo);
    res.status(201).json(pagamento);
  } catch (erro) {
    next(erro);
  }
}
