import { Estoque, MovimentacaoEstoque } from '../../infrastructure/database/models';
import { erroConflito } from '../../domain/errors';
import { registrarLog } from '../../infrastructure/repositories/logRepository';

// Consulta estoque de uma unidade, opcionalmente por produto
export async function consultarEstoque(unidadeId: string, produtoId?: string) {
  const where: any = { unidadeId };

  if (produtoId) {
    where.produtoId = produtoId;
  }

  const estoques = await Estoque.find(where).populate('produtoId');
  return estoques;
}

// Registra uma movimentação de estoque
export async function registrarMovimentacao(dados: {
  produtoId: string;
  unidadeId: string;
  tipo: string;
  quantidade: number;
  motivo?: string;
  usuarioId?: string;
}) {
  // Busca ou cria registro de estoque
  let estoque = await Estoque.findOne({
    produtoId: dados.produtoId,
    unidadeId: dados.unidadeId
  });

  if (!estoque) {
    estoque = await Estoque.create({
      produtoId: dados.produtoId,
      unidadeId: dados.unidadeId,
      quantidade: 0
    });
  }

  if (dados.tipo === 'ENTRADA') {
    await Estoque.findByIdAndUpdate(estoque._id, {
      $inc: { quantidade: dados.quantidade }
    });
  } else if (dados.tipo === 'SAIDA') {
    if (estoque.quantidade < dados.quantidade) {
      throw erroConflito('Estoque insuficiente para esta movimentação');
    }

    await Estoque.findByIdAndUpdate(estoque._id, {
      $inc: { quantidade: -dados.quantidade }
    });
  }

  const movimentacao = await MovimentacaoEstoque.create({
    estoqueId: estoque._id,
    tipo: dados.tipo,
    quantidade: dados.quantidade,
    motivo: dados.motivo || undefined
  });

  if (dados.usuarioId) {
    await registrarLog({
      usuarioId: dados.usuarioId,
      acao: 'MOVIMENTACAO_ESTOQUE',
      entidade: 'Estoque',
      entidadeId: estoque._id.toString(),
      detalhes: { tipo: dados.tipo, quantidade: dados.quantidade, motivo: dados.motivo }
    });
  }

  return movimentacao;
}
