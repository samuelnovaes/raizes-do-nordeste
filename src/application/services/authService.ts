import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../../infrastructure/database/models/index.ts';
import { erroNaoEncontrado, erroConflito, erroNaoAutenticado } from '../../domain/errors/index.ts';
import { registrarLog } from '../../infrastructure/repositories/logRepository.ts';

// Registra um novo usuário no sistema
export async function registrarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  perfil?: string;
  consentimentoLgpd: boolean;
}) {
  const usuarioExistente = await Usuario.findOne({ email: dados.email });

  if (usuarioExistente) {
    throw erroConflito('Email já cadastrado');
  }

  const senhaHash = await bcrypt.hash(dados.senha, 10);

  const usuario = await Usuario.create({
    nome: dados.nome,
    email: dados.email,
    senha: senhaHash,
    perfil: dados.perfil || 'CLIENTE',
    consentimentoLgpd: dados.consentimentoLgpd
  });

  await registrarLog({
    usuarioId: usuario._id.toString(),
    acao: 'REGISTRO',
    entidade: 'Usuario',
    entidadeId: usuario._id.toString()
  });

  const { senha: _, ...usuarioSemSenha } = usuario.toObject();
  return usuarioSemSenha;
}

// Autentica um usuário e retorna tokens
export async function loginUsuario(email: string, senha: string) {
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    throw erroNaoAutenticado();
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw erroNaoAutenticado();
  }

  const segredo = process.env.JWT_SECRET;
  const expiracao = process.env.JWT_EXPIRES_IN || '1d';

  if (!segredo) {
    throw new Error('JWT_SECRET não configurado');
  }

  const payload = { id: usuario._id.toString(), email: usuario.email, perfil: usuario.perfil };

  const token = jwt.sign(payload, segredo as string, { expiresIn: expiracao } as jwt.SignOptions);
  const tokenRefresh = jwt.sign(payload, segredo as string, { expiresIn: '7d' } as jwt.SignOptions);

  return { token, refreshToken: tokenRefresh, usuario: payload };
}

// Gera um novo token a partir do refresh token
export async function refreshToken(token: string) {
  const segredo = process.env.JWT_SECRET;
  const expiracao = process.env.JWT_EXPIRES_IN || '1d';

  if (!segredo) {
    throw new Error('JWT_SECRET não configurado');
  }

  try {
    const payload = jwt.verify(token, segredo) as { id: string; email: string; perfil: string };
    const novoToken = jwt.sign(
      { id: payload.id, email: payload.email, perfil: payload.perfil },
      segredo as string,
      { expiresIn: expiracao } as jwt.SignOptions
    );

    return { token: novoToken };
  } catch {
    throw erroNaoAutenticado();
  }
}
