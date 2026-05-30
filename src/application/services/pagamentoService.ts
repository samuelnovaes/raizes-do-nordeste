import { Pedido, Pagamento } from '../../infrastructure/database/models/index.ts';
import { erroNaoEncontrado } from '../../domain/errors/index.ts';
import { registrarLog } from '../../infrastructure/repositories/logRepository.ts';
import { processarPagamentoMock } from '../../infrastructure/external/pagamentoMock.ts';

// Processa o pagamento de um pedido
export async function processarPagamento(pedidoId: string, metodo: string) {
  const pedido = await Pedido.findById(pedidoId);

  if (!pedido) {
    throw erroNaoEncontrado('Pedido');
  }

  const resultado = processarPagamentoMock(Number(pedido.total), metodo);

  const status = resultado.sucesso ? 'APROVADO' : 'RECUSADO';

  const pagamento = await Pagamento.create({
    pedidoId: pedido._id,
    metodo,
    valor: pedido.total,
    status,
    transacaoId: resultado.transacaoId || undefined
  });

  // Se aprovado, atualiza status do pedido para PAGO
  if (resultado.sucesso) {
    await Pedido.findByIdAndUpdate(pedidoId, { status: 'PAGO' });
  }

  await registrarLog({
    usuarioId: pedido.usuarioId.toString(),
    acao: 'PROCESSAR_PAGAMENTO',
    entidade: 'Pagamento',
    entidadeId: pagamento._id.toString(),
    detalhes: { metodo, status, valor: Number(pedido.total) }
  });

  return pagamento;
}
