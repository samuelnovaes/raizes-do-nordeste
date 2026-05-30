import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { erroNaoAutenticado, erroSemPermissao } from '../../domain/errors/index.ts';

// Extensão do tipo Request para incluir dados do usuário
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        perfil: string;
      };
    }
  }
}

// Middleware de autenticação JWT
export function autenticacao(req: Request, _res: Response, next: NextFunction): void {
  const cabecalhoAuth = req.headers.authorization;

  if (!cabecalhoAuth || !cabecalhoAuth.startsWith('Bearer ')) {
    throw erroNaoAutenticado();
  }

  const token = cabecalhoAuth.split(' ')[1];

  try {
    const segredo = process.env.JWT_SECRET || 'segredo-padrao';
    const payload = jwt.verify(token, segredo) as {
      id: string;
      email: string;
      perfil: string;
    };

    req.usuario = {
      id: payload.id,
      email: payload.email,
      perfil: payload.perfil
    };

    next();
  } catch {
    throw erroNaoAutenticado();
  }
}

// Middleware de autorização por perfis
export function autorizarPerfis(...perfis: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw erroNaoAutenticado();
    }

    if (!perfis.includes(req.usuario.perfil)) {
      throw erroSemPermissao();
    }

    next();
  };
}
