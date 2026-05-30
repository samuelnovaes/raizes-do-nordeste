import { Pedido, Estoque, Produto } from '../../infrastructure/database/models/index.ts';
import { erroNaoEncontrado, erroConflito } from '../../domain/errors/index.ts';
import { registrarLog } from '../../infrastructure/repositories/logRepository.ts';
import { registrarMovimentacao } from './estoqueService.ts';

// Transições de status permitidas
const transicoesPermitidas: Record<string, string[]> = {
  'AGUARDANDO_PAGAMENTO': ['PAGO', 'CANCELADO'],
  'PAGO': ['EM_PREPARO', 'CANCELADO'],
  'EM_PREPARO': ['PRONTO', 'CANCELADO'],
  'PRONTO': ['ENTREGUE', 'CANCELADO']
};

// Cria um novo pedido com validação de estoque
export async function criarPedido(dados: {
  usuarioId: string;
  unidadeId: string;
  canalPedido: string;
  itens: { produtoId: string; quantidade: number }[];
  formaPagamento: string;
}) {
  // Valida estoque e calcula total
  let total = 0;
  const itensComPreco: { produtoId: string; quantidade: number; precoUnitario: number }[] = [];

  for (const item of dados.itens) {
    const estoque = await Estoque.findOne({
      produtoId: item.produtoId,
      unidadeId: dados.unidadeId
    });

    if (!estoque || estoque.quantidade < item.quantidade) {
      throw erroConflito(`Estoque insuficiente para o produto ${item.produtoId}`);
    }

    const produto = await Produto.findById(item.produtoId);
    if (!produto) {
      throw erroNaoEncontrado('Produto');
    }

    const preco = Number(produto.preco);
    total += preco * item.quantidade;
    itensComPreco.push({ produtoId: item.produtoId, quantidade: item.quantidade, precoUnitario: preco });
  }

  // Reduz estoque para cada item
  for (const item of dados.itens) {
    await registrarMovimentacao({
      produtoId: item.produtoId,
      unidadeId: dados.unidadeId,
      tipo: 'SAIDA',
      quantidade: item.quantidade,
      motivo: 'Venda - Pedido',
      usuarioId: dados.usuarioId
    });
  }

  // Cria o pedido
  const pedido = await Pedido.create({
    usuarioId: dados.usuarioId,
    unidadeId: dados.unidadeId,
    canalPedido: dados.canalPedido,
    formaPagamento: dados.formaPagamento,
    status: 'AGUARDANDO_PAGAMENTO',
    total,
    itens: itensComPreco.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario
    }))
  });

  await registrarLog({
    usuarioId: dados.usuarioId,
    acao: 'CRIAR_PEDIDO',
    entidade: 'Pedido',
    entidadeId: pedido._id.toString(),
    detalhes: { total, canalPedido: dados.canalPedido }
  });

  return pedido;
}

// Lista pedidos com filtros e paginação
export async function listarPedidos(filtros: {
  canalPedido?: string;
  status?: string;
  unidadeId?: string;
  page?: number;
  limit?: number;
}) {
  const pagina = filtros.page || 1;
  const limite = filtros.limit || 20;
  const skip = (pagina - 1) * limite;

  const where: any = {};

  if (filtros.canalPedido) {
    where.canalPedido = filtros.canalPedido;
  }

  if (filtros.status) {
    where.status = filtros.status;
  }

  if (filtros.unidadeId) {
    where.unidadeId = filtros.unidadeId;
  }

  const [pedidos, total] = await Promise.all([
    Pedido.find(where).skip(skip).limit(limite).sort({ criadoEm: -1 }),
    Pedido.countDocuments(where)
  ]);

  return {
    dados: pedidos,
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite)
  };
}

// Busca um pedido pelo ID
export async function buscarPedido(id: string) {
  const pedido = await Pedido.findById(id).populate('itens.produtoId');

  if (!pedido) {
    throw erroNaoEncontrado('Pedido');
  }

  return pedido;
}

// Atualiza o status de um pedido com validação de transição
export async function atualizarStatusPedido(id: string, novoStatus: string, usuarioId: string) {
  const pedido = await buscarPedido(id);

  const statusAtual = pedido.status;

  // Qualquer status pode ir para CANCELADO
  if (novoStatus !== 'CANCELADO') {
    const permitidos = transicoesPermitidas[statusAtual];

    if (!permitidos || !permitidos.includes(novoStatus)) {
      throw erroConflito(`Transição de ${statusAtual} para ${novoStatus} não permitida`);
    }
  }

  const pedidoAtualizado = await Pedido.findByIdAndUpdate(id, { status: novoStatus }, { new: true });

  await registrarLog({
    usuarioId,
    acao: 'ATUALIZAR_STATUS_PEDIDO',
    entidade: 'Pedido',
    entidadeId: id,
    detalhes: { statusAnterior: statusAtual, novoStatus }
  });

  return pedidoAtualizado;
}
