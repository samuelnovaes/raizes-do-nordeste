import type { Request, Response, NextFunction } from 'express';
import * as estoqueService from '../../application/services/estoqueService';

// Consulta estoque de uma unidade
export async function consultar(req: Request, res: Response, next: NextFunction) {
  try {
    const unidadeId = req.params.unidadeId as string;
    const produtoId = req.query.produtoId ? String(req.query.produtoId) : undefined;
    const estoques = await estoqueService.consultarEstoque(unidadeId, produtoId);
    res.json(estoques);
  } catch (erro) {
    next(erro);
  }
}

// Registra movimentação de estoque
export async function registrarMovimentacao(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = { ...req.body, usuarioId: req.usuario?.id };
    const movimentacao = await estoqueService.registrarMovimentacao(dados);
    res.status(201).json(movimentacao);
  } catch (erro) {
    next(erro);
  }
}
