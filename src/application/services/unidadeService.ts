import { Unidade } from '../../infrastructure/database/models';
import { erroNaoEncontrado } from '../../domain/errors';

// Lista unidades com filtros opcionais
export async function listarUnidades(filtros?: { nome?: string; cidade?: string }) {
  const where: any = {};

  if (filtros?.nome) {
    where.nome = { $regex: filtros.nome, $options: 'i' };
  }

  if (filtros?.cidade) {
    where.cidade = { $regex: filtros.cidade, $options: 'i' };
  }

  const unidades = await Unidade.find(where);
  return unidades;
}

// Busca uma unidade pelo ID
export async function buscarUnidade(id: string) {
  const unidade = await Unidade.findById(id);

  if (!unidade) {
    throw erroNaoEncontrado('Unidade');
  }

  return unidade;
}

// Cria uma nova unidade
export async function criarUnidade(dados: {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
}) {
  const unidade = await Unidade.create(dados);
  return unidade;
}

// Atualiza uma unidade existente
export async function atualizarUnidade(id: string, dados: {
  nome?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}) {
  await buscarUnidade(id);

  const unidade = await Unidade.findByIdAndUpdate(id, dados, { new: true });
  return unidade;
}
