import { Fidelidade, Usuario } from '../../infrastructure/database/models/index.ts';
import { erroConflito, erroNaoEncontrado } from '../../domain/errors/index.ts';
import { registrarLog } from '../../infrastructure/repositories/logRepository.ts';

// Consulta pontos de fidelidade do usuário
export async function consultarPontos(usuarioId: string) {
  const fidelidade = await Fidelidade.findOne({ usuarioId });

  if (!fidelidade) {
    return { usuarioId, pontos: 0 };
  }

  return fidelidade;
}

// Acumula pontos baseado no valor gasto (1 ponto a cada R$10)
export async function acumularPontos(usuarioId: string, valor: number) {
  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw erroNaoEncontrado('Usuário');
  }

  if (!usuario.consentimentoLgpd) {
    throw erroConflito('Usuário não possui consentimento para acumular pontos');
  }

  const pontosGanhos = Math.floor(valor / 10);

  if (pontosGanhos <= 0) {
    return await consultarPontos(usuarioId);
  }

  const fidelidade = await Fidelidade.findOneAndUpdate(
    { usuarioId },
    { $inc: { pontos: pontosGanhos }, $setOnInsert: { usuarioId } },
    { upsert: true, new: true }
  );

  await registrarLog({
    usuarioId,
    acao: 'ACUMULAR_PONTOS',
    entidade: 'Fidelidade',
    entidadeId: fidelidade._id.toString(),
    detalhes: { pontosGanhos, valorCompra: valor }
  });

  return fidelidade;
}

// Registra resgate de pontos
export async function registrarResgate(usuarioId: string, pontos: number, descricao: string) {
  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw erroNaoEncontrado('Usuário');
  }

  if (!usuario.consentimentoLgpd) {
    throw erroConflito('Usuário não possui consentimento LGPD para operações de fidelidade');
  }

  const fidelidade = await Fidelidade.findOne({ usuarioId });

  if (!fidelidade || fidelidade.pontos < pontos) {
    throw erroConflito('Pontos insuficientes para resgate');
  }

  const fidelidadeAtualizada = await Fidelidade.findOneAndUpdate(
    { usuarioId },
    { $inc: { pontos: -pontos } },
    { new: true }
  );

  await registrarLog({
    usuarioId,
    acao: 'RESGATE_PONTOS',
    entidade: 'Fidelidade',
    entidadeId: fidelidade._id.toString(),
    detalhes: { pontosResgatados: pontos, descricao }
  });

  return fidelidadeAtualizada;
}
