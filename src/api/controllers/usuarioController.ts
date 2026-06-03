import type { Request, Response, NextFunction } from 'express';
import { Usuario } from '../../infrastructure/database/models/index.ts';
import { erroNaoEncontrado } from '../../domain/errors/index.ts';

// Lista todos os usuários (apenas ADMIN)
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [usuarios, total] = await Promise.all([
      Usuario.find({}, '-senha').skip(skip).limit(limit).sort({ criadoEm: -1 }),
      Usuario.countDocuments()
    ]);

    res.json({ dados: usuarios, total, page, limit });
  } catch (erro) {
    next(erro);
  }
}

// Busca um usuário por ID (apenas ADMIN)
export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      throw erroNaoEncontrado('Usuário');
    }
    res.json(usuario);
  } catch (erro) {
    next(erro);
  }
}
