import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../domain/errors/AppError';

// Middleware global de tratamento de erros
export function erroHandler(
  erro: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = randomUUID();

  if (erro instanceof AppError) {
    res.status(erro.statusCode).json({
      error: erro.codigo,
      message: erro.message,
      details: erro.detalhes,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      requestId
    });
    return;
  }

  console.error('Erro inesperado:', erro);

  res.status(500).json({
    error: 'ERRO_INTERNO',
    message: 'Erro interno do servidor',
    details: [],
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId
  });
}
