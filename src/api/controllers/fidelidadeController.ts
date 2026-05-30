import type { Request, Response, NextFunction } from 'express';
import * as fidelidadeService from '../../application/services/fidelidadeService.ts';

// Consulta pontos de fidelidade do usuário
export async function consultarPontos(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await fidelidadeService.consultarPontos(req.usuario!.id);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// Registra resgate de pontos
export async function resgatar(req: Request, res: Response, next: NextFunction) {
  try {
    const { pontos, descricao } = req.body;
    const resultado = await fidelidadeService.registrarResgate(req.usuario!.id, pontos, descricao);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}
