import type { Request, Response, NextFunction } from 'express';
import * as promocaoService from '../../application/services/promocaoService';

// Lista promoções ativas
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const filtros = {
      unidadeId: req.query.unidadeId as string | undefined,
      canalPedido: req.query.canalPedido as string | undefined,
      produtoId: req.query.produtoId as string | undefined
    };
    const resultado = await promocaoService.listarPromocoes(filtros);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// Busca uma promoção pelo ID
export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const promocao = await promocaoService.buscarPromocao(req.params.id as string);
    res.json(promocao);
  } catch (erro) {
    next(erro);
  }
}

// Cria uma nova promoção
export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const promocao = await promocaoService.criarPromocao(req.body);
    res.status(201).json(promocao);
  } catch (erro) {
    next(erro);
  }
}

// Atualiza uma promoção existente
export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const promocao = await promocaoService.atualizarPromocao(req.params.id as string, req.body);
    res.json(promocao);
  } catch (erro) {
    next(erro);
  }
}

// Desativa uma promoção
export async function desativar(req: Request, res: Response, next: NextFunction) {
  try {
    const promocao = await promocaoService.desativarPromocao(req.params.id as string);
    res.json(promocao);
  } catch (erro) {
    next(erro);
  }
}
