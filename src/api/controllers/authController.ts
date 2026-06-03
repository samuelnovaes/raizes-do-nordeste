import type { Request, Response, NextFunction } from 'express';
import { registrarUsuario, loginUsuario, refreshToken } from '../../application/services/authService';
import { Usuario } from '../../infrastructure/database/models';
import { erroNaoEncontrado } from '../../domain/errors';

// Registra um novo usuário
export async function registrar(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await registrarUsuario(req.body);
    res.status(201).json(usuario);
  } catch (erro) {
    next(erro);
  }
}

// Autentica um usuário
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, senha } = req.body;
    const resultado = await loginUsuario(email, senha);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// Renova o token de acesso
export async function renovarToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    const resultado = await refreshToken(token);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// Retorna o perfil do usuário autenticado
export async function perfil(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await Usuario.findById((req as any).usuario.id).select('-senha');
    if (!usuario) {
      throw erroNaoEncontrado('Usuário');
    }
    res.json(usuario);
  } catch (erro) {
    next(erro);
  }
}
