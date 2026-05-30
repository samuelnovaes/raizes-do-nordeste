import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

// Fábrica de middleware de validação com Zod
export function validacao(esquema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      esquema.parse(req.body);
      next();
    } catch (erro) {
      if (erro instanceof ZodError) {
        const issues = erro.issues;
        const detalhes = issues.map(
          (e: any) => `${e.path.join('.')}: ${e.message}`
        );

        res.status(422).json({
          error: 'ERRO_VALIDACAO',
          message: 'Erro de validação',
          details: detalhes,
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
        return;
      }
      next(erro);
    }
  };
}
