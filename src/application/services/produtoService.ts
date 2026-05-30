import { Produto, Estoque } from '../../infrastructure/database/models/index.ts';
import { erroNaoEncontrado } from '../../domain/errors/index.ts';

// Lista produtos com paginação e filtros
export async function listarProdutos(filtros?: {
  nome?: string;
  categoria?: string;
  page?: number;
  limit?: number;
}) {
  const pagina = filtros?.page || 1;
  const limite = filtros?.limit || 20;
  const skip = (pagina - 1) * limite;

  const where: any = {};

  if (filtros?.nome) {
    where.nome = { $regex: filtros.nome, $options: 'i' };
  }

  if (filtros?.categoria) {
    // Busca por nome de categoria via populate - filtramos após
    // Alternativa: buscar categoria primeiro
    const { Categoria } = await import('../../infrastructure/database/models/index.ts');
    const cat = await Categoria.findOne({ nome: filtros.categoria });
    if (cat) {
      where.categoriaId = cat._id;
    }
  }

  const [produtos, total] = await Promise.all([
    Produto.find(where).skip(skip).limit(limite),
    Produto.countDocuments(where)
  ]);

  return {
    dados: produtos,
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite)
  };
}

// Busca um produto pelo ID
export async function buscarProduto(id: string) {
  const produto = await Produto.findById(id);

  if (!produto) {
    throw erroNaoEncontrado('Produto');
  }

  return produto;
}

// Cria um novo produto
export async function criarProduto(dados: {
  nome: string;
  descricao?: string;
  preco: number;
  categoriaId: string;
  imagem?: string;
}) {
  const produto = await Produto.create({
    nome: dados.nome,
    descricao: dados.descricao,
    preco: dados.preco,
    categoriaId: dados.categoriaId
  });
  return produto;
}

// Atualiza um produto existente
export async function atualizarProduto(id: string, dados: {
  nome?: string;
  descricao?: string;
  preco?: number;
  categoriaId?: string;
  imagem?: string;
}) {
  await buscarProduto(id);

  const updateData: any = {};
  if (dados.nome !== undefined) updateData.nome = dados.nome;
  if (dados.descricao !== undefined) updateData.descricao = dados.descricao;
  if (dados.preco !== undefined) updateData.preco = dados.preco;
  if (dados.categoriaId !== undefined) updateData.categoriaId = dados.categoriaId;

  const produto = await Produto.findByIdAndUpdate(id, updateData, { new: true });
  return produto;
}

// Lista cardápio de uma unidade (produtos com estoque > 0)
export async function listarCardapioPorUnidade(unidadeId: string) {
  const estoques = await Estoque.find({
    unidadeId,
    quantidade: { $gt: 0 }
  }).populate('produtoId');

  return estoques.map((e) => ({
    ...(e.produtoId as any).toObject(),
    quantidadeDisponivel: e.quantidade
  }));
}
