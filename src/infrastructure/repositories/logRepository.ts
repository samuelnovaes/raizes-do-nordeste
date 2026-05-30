import { LogAuditoria } from '../database/models/index.ts';

interface DadosLog {
  usuarioId: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  detalhes?: object;
}

// Registra uma entrada de log de auditoria
export async function registrarLog(dados: DadosLog): Promise<void> {
  await LogAuditoria.create({
    usuarioId: dados.usuarioId,
    acao: dados.acao,
    entidade: dados.entidade,
    entidadeId: dados.entidadeId ?? undefined,
    detalhes: dados.detalhes ? JSON.stringify(dados.detalhes) : undefined
  });
}
