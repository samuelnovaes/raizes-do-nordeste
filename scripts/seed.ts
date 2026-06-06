import 'dotenv/config';
import { conectarMongoDB, desconectarMongoDB } from '../src/infrastructure/database/mongoose';
import { Usuario, Unidade, Categoria, Produto, Estoque, Fidelidade } from '../src/infrastructure/database/models';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed do banco de dados...');

  await conectarMongoDB();

  // Criar categorias
  const categoriasNomes = ['Lanches', 'Bebidas', 'Sobremesas', 'Acompanhamentos'];
  const categorias = await Promise.all(
    categoriasNomes.map((nome) =>
      Categoria.findOneAndUpdate({ nome }, { nome }, { upsert: true, new: true })
    )
  );

  // Criar unidades
  const unidadesData = [
    { nome: 'Raízes Centro', endereco: 'Rua da Aurora, 100', cidade: 'Recife', estado: 'PE' },
    { nome: 'Raízes Boa Viagem', endereco: 'Av. Boa Viagem, 2000', cidade: 'Recife', estado: 'PE' },
    { nome: 'Raízes Meireles', endereco: 'Av. Beira Mar, 500', cidade: 'Fortaleza', estado: 'CE' }
  ];
  const unidades = await Promise.all(
    unidadesData.map((u) =>
      Unidade.findOneAndUpdate({ nome: u.nome }, u, { upsert: true, new: true })
    )
  );

  // Criar produtos
  const produtosData = [
    { nome: 'Baião de Dois Burger', descricao: 'Hambúrguer com queijo coalho e baião de dois', preco: 29.90, categoriaId: categorias[0]._id },
    { nome: 'Tapioca Recheada', descricao: 'Tapioca com carne de sol e queijo', preco: 19.90, categoriaId: categorias[0]._id },
    { nome: 'Acarajé Especial', descricao: 'Acarajé com vatapá e camarão', preco: 24.90, categoriaId: categorias[0]._id },
    { nome: 'Suco de Cajá', descricao: 'Suco natural de cajá 500ml', preco: 9.90, categoriaId: categorias[1]._id },
    { nome: 'Guaraná Jesus', descricao: 'Guaraná Jesus 350ml', preco: 7.90, categoriaId: categorias[1]._id },
    { nome: 'Cartola', descricao: 'Banana frita com queijo coalho e canela', preco: 14.90, categoriaId: categorias[2]._id },
    { nome: 'Macaxeira Frita', descricao: 'Porção de macaxeira frita crocante', preco: 12.90, categoriaId: categorias[3]._id }
  ];
  const produtos = await Promise.all(
    produtosData.map((p) =>
      Produto.findOneAndUpdate({ nome: p.nome }, p, { upsert: true, new: true })
    )
  );

  // Criar estoque para cada unidade
  for (const unidade of unidades) {
    for (const produto of produtos) {
      await Estoque.findOneAndUpdate(
        { produtoId: produto._id, unidadeId: unidade._id },
        { produtoId: produto._id, unidadeId: unidade._id, quantidade: 50 },
        { upsert: true }
      );
    }
  }

  // Criar usuários de teste
  const senhaHash = await bcrypt.hash('Senha@123', 10);

  const usuarios = [
    { nome: 'Administrador', email: 'admin@raizes.com', senha: senhaHash, perfil: 'ADMIN', consentimentoLgpd: true },
    { nome: 'Maria Gerente', email: 'gerente@raizes.com', senha: senhaHash, perfil: 'GERENTE', consentimentoLgpd: true },
    { nome: 'João Atendente', email: 'atendente@raizes.com', senha: senhaHash, perfil: 'ATENDENTE', consentimentoLgpd: true },
    { nome: 'Ana Cozinha', email: 'cozinha@raizes.com', senha: senhaHash, perfil: 'COZINHA', consentimentoLgpd: true },
    { nome: 'Carlos Cliente', email: 'cliente@raizes.com', senha: senhaHash, perfil: 'CLIENTE', cpf: '12345678901', consentimentoLgpd: true }
  ];

  for (const u of usuarios) {
    await Usuario.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
  }

  // Criar fidelidade para o cliente
  const cliente = await Usuario.findOne({ email: 'cliente@raizes.com' });
  if (cliente) {
    await Fidelidade.findOneAndUpdate(
      { usuarioId: cliente._id },
      { usuarioId: cliente._id, pontos: 100, consentimento: true },
      { upsert: true }
    );
  }

  // Criar promoção
  const Promocao = (await import('../src/infrastructure/database/models')).Promocao;
  const promocao = await Promocao.findOneAndUpdate(
    { nome: 'Promoção de Verão' },
    { 
      nome: 'Promoção de Verão', 
      descricao: 'Desconto em bebidas', 
      tipo: 'PERCENTUAL', 
      valor: 10, 
      dataInicio: new Date(), 
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      ativo: true, 
      canalPedido: 'TODOS'
    },
    { upsert: true, new: true }
  );

  // Criar pedido
  const Pedido = (await import('../src/infrastructure/database/models')).Pedido;
  await Pedido.findOneAndUpdate(
    { usuarioId: cliente?._id },
    {
      usuarioId: cliente?._id,
      unidadeId: unidades[0]._id,
      canalPedido: 'TOTEM',
      status: 'AGUARDANDO_PAGAMENTO',
      itens: [{ produtoId: produtos[0]._id, quantidade: 2, precoUnitario: produtos[0].preco }],
      total: produtos[0].preco * 2,
      formaPagamento: 'PIX'
    },
    { upsert: true }
  );

  console.log('Seed concluído com sucesso!');
  await desconectarMongoDB();
}

main().catch((e) => {
  console.error('Erro no seed:', e);
  process.exit(1);
});
