import type { Request, Response, NextFunction } from 'express';
import * as pedidoService from '../../application/services/pedidoService.ts';

// Cria um novo pedido
export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = { ...req.body, usuarioId: req.usuario!.id };
    const pedido = await pedidoService.criarPedido(dados);
    res.status(201).json(pedido);
  } catch (erro) {
    next(erro);
  }
}

// Lista pedidos com filtros
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const filtros = {
      canalPedido: req.query.canalPedido as string | undefined,
      status: req.query.status as string | undefined,
      unidadeId: req.query.unidadeId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };
    const resultado = await pedidoService.listarPedidos(filtros);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// Busca um pedido pelo ID
export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const pedido = await pedidoService.buscarPedido(req.params.id as string);
    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
}

// Atualiza o status de um pedido
export async function atualizarStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const pedido = await pedidoService.atualizarStatusPedido(id, status, req.usuario!.id);
    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
}
