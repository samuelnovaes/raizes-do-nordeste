import type { Request, Response, NextFunction } from 'express';
import * as unidadeService from '../../application/services/unidadeService';

// Lista todas as unidades
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const filtros = {
      nome: req.query.nome as string | undefined,
      cidade: req.query.cidade as string | undefined
    };
    const unidades = await unidadeService.listarUnidades(filtros);
    res.json(unidades);
  } catch (erro) {
    next(erro);
  }
}

// Busca uma unidade pelo ID
export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const unidade = await unidadeService.buscarUnidade(req.params.id as string);
    res.json(unidade);
  } catch (erro) {
    next(erro);
  }
}

// Cria uma nova unidade
export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const unidade = await unidadeService.criarUnidade(req.body);
    res.status(201).json(unidade);
  } catch (erro) {
    next(erro);
  }
}

// Atualiza uma unidade existente
export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const unidade = await unidadeService.atualizarUnidade(req.params.id as string, req.body);
    res.json(unidade);
  } catch (erro) {
    next(erro);
  }
}
