import { Promocao } from '../../infrastructure/database/models';
import { erroNaoEncontrado } from '../../domain/errors';

// Lista promoções ativas com filtros opcionais
export async function listarPromocoes(filtros?: {
  unidadeId?: string;
  canalPedido?: string;
  produtoId?: string;
}) {
  const agora = new Date();

  const where: any = {
    ativo: true,
    dataInicio: { $lte: agora },
    dataFim: { $gte: agora }
  };

  if (filtros?.unidadeId) {
    // Promoções sem unidade específica (globais) OU da unidade informada
    where.$or = [
      { unidadeId: { $exists: false } },
      { unidadeId: null },
      { unidadeId: filtros.unidadeId }
    ];
  }

  if (filtros?.canalPedido) {
    where.$and = [
      ...(where.$and || []),
      {
        $or: [
          { canalPedido: { $exists: false } },
          { canalPedido: null },
          { canalPedido: filtros.canalPedido }
        ]
      }
    ];
  }

  if (filtros?.produtoId) {
    where.$and = [
      ...(where.$and || []),
      {
        $or: [
          { produtoId: { $exists: false } },
          { produtoId: null },
          { produtoId: filtros.produtoId }
        ]
      }
    ];
  }

  const promocoes = await Promocao.find(where).sort({ criadoEm: -1 });

  return { dados: promocoes };
}

// Busca uma promoção pelo ID
export async function buscarPromocao(id: string) {
  const promocao = await Promocao.findById(id);

  if (!promocao) {
    throw erroNaoEncontrado('Promoção');
  }

  return promocao;
}

// Cria uma nova promoção
export async function criarPromocao(dados: {
  nome: string;
  descricao: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO' | 'LEVE_PAGUE';
  valor: number;
  dataInicio: string;
  dataFim: string;
  unidadeId?: string;
  produtoId?: string;
  canalPedido?: string;
  ativo?: boolean;
}) {
  const promocao = await Promocao.create({
    nome: dados.nome,
    descricao: dados.descricao,
    tipo: dados.tipo,
    valor: dados.valor,
    dataInicio: new Date(dados.dataInicio),
    dataFim: new Date(dados.dataFim),
    unidadeId: dados.unidadeId ?? undefined,
    produtoId: dados.produtoId ?? undefined,
    canalPedido: dados.canalPedido ?? undefined,
    ativo: dados.ativo ?? true
  });

  return promocao;
}

// Atualiza uma promoção existente
export async function atualizarPromocao(id: string, dados: {
  nome?: string;
  descricao?: string;
  tipo?: 'PERCENTUAL' | 'VALOR_FIXO' | 'LEVE_PAGUE';
  valor?: number;
  dataInicio?: string;
  dataFim?: string;
  unidadeId?: string;
  produtoId?: string;
  canalPedido?: string;
  ativo?: boolean;
}) {
  await buscarPromocao(id);

  const updateData: any = {};
  if (dados.nome !== undefined) updateData.nome = dados.nome;
  if (dados.descricao !== undefined) updateData.descricao = dados.descricao;
  if (dados.tipo !== undefined) updateData.tipo = dados.tipo;
  if (dados.valor !== undefined) updateData.valor = dados.valor;
  if (dados.dataInicio !== undefined) updateData.dataInicio = new Date(dados.dataInicio);
  if (dados.dataFim !== undefined) updateData.dataFim = new Date(dados.dataFim);
  if (dados.unidadeId !== undefined) updateData.unidadeId = dados.unidadeId;
  if (dados.produtoId !== undefined) updateData.produtoId = dados.produtoId;
  if (dados.canalPedido !== undefined) updateData.canalPedido = dados.canalPedido;
  if (dados.ativo !== undefined) updateData.ativo = dados.ativo;

  const promocao = await Promocao.findByIdAndUpdate(id, updateData, { new: true });
  return promocao;
}

// Desativa uma promoção (soft delete)
export async function desativarPromocao(id: string) {
  await buscarPromocao(id);

  const promocao = await Promocao.findByIdAndUpdate(id, { ativo: false }, { new: true });
  return promocao;
}
