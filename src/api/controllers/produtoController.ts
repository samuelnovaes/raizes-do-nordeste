import type { Request, Response, NextFunction } from 'express';
import * as produtoService from '../../application/services/produtoService';

// Lista produtos com paginação
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const filtros = {
      nome: req.query.nome as string | undefined,
      categoria: req.query.categoria as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };
    const resultado = await produtoService.listarProdutos(filtros);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// Busca um produto pelo ID
export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const produto = await produtoService.buscarProduto(req.params.id as string);
    res.json(produto);
  } catch (erro) {
    next(erro);
  }
}

// Cria um novo produto
export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const produto = await produtoService.criarProduto(req.body);
    res.status(201).json(produto);
  } catch (erro) {
    next(erro);
  }
}

// Atualiza um produto existente
export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const produto = await produtoService.atualizarProduto(req.params.id as string, req.body);
    res.json(produto);
  } catch (erro) {
    next(erro);
  }
}

// Lista cardápio de uma unidade
export async function cardapioPorUnidade(req: Request, res: Response, next: NextFunction) {
  try {
    const produtos = await produtoService.listarCardapioPorUnidade(req.params.unidadeId as string);
    res.json(produtos);
  } catch (erro) {
    next(erro);
  }
}
