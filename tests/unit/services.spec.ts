import { expect } from 'chai';
import sinon from 'sinon';

import { mockModels } from '../helpers/setup.ts';
import * as fidelidadeService from '../../src/application/services/fidelidadeService.ts';
import * as estoqueService from '../../src/application/services/estoqueService.ts';
import * as pedidoService from '../../src/application/services/pedidoService.ts';
import * as produtoService from '../../src/application/services/produtoService.ts';
import { registrarLog } from '../../src/infrastructure/repositories/logRepository.ts';
import { Usuario, Fidelidade, Estoque, MovimentacaoEstoque, Pedido, Produto, LogAuditoria } from '../../src/infrastructure/database/models/index.ts';

describe('FidelidadeService - Unit', () => {
  afterEach(() => {
    Object.values(mockModels).forEach((modelo: any) => {
      if (typeof modelo === 'object' && modelo !== null) {
        Object.values(modelo).forEach((metodo: any) => {
          if (typeof metodo?.reset === 'function') {
            metodo.reset();
          }
        });
      }
    });
  });

  describe('consultarPontos', () => {
    it('deve retornar pontos zero quando não existe registro', async () => {
      mockModels.fidelidade.findOne.resolves(null);

      const resultado = await fidelidadeService.consultarPontos('abc123');

      expect(resultado).to.deep.equal({ usuarioId: 'abc123', pontos: 0 });
    });
  });

  describe('acumularPontos', () => {
    it('deve acumular pontos baseado no valor', async () => {
      mockModels.usuario.findById.resolves({ _id: 'abc123', consentimentoLgpd: true } as any);
      mockModels.fidelidade.findOneAndUpdate.resolves({ _id: 'fid1', usuarioId: 'abc123', pontos: 10 } as any);
      mockModels.logAuditoria.create.resolves({} as any);

      const resultado = await fidelidadeService.acumularPontos('abc123', 100);

      expect(resultado).to.have.property('pontos', 10);
    });

    it('deve lançar erro quando usuário não existe', async () => {
      mockModels.usuario.findById.resolves(null);

      try {
        await fidelidadeService.acumularPontos('abc999', 100);
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });

    it('deve lançar erro quando usuário não tem consentimento LGPD', async () => {
      mockModels.usuario.findById.resolves({ _id: 'abc123', consentimentoLgpd: false } as any);

      try {
        await fidelidadeService.acumularPontos('abc123', 100);
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(409);
      }
    });

    it('deve retornar pontos atuais quando valor gera 0 pontos', async () => {
      mockModels.usuario.findById.resolves({ _id: 'abc123', consentimentoLgpd: true } as any);
      mockModels.fidelidade.findOne.resolves({ _id: 'fid1', usuarioId: 'abc123', pontos: 5 } as any);

      const resultado = await fidelidadeService.acumularPontos('abc123', 5);

      expect(resultado).to.have.property('pontos', 5);
    });
  });

  describe('registrarResgate', () => {
    it('deve lançar erro quando usuário não existe', async () => {
      mockModels.usuario.findById.resolves(null);

      try {
        await fidelidadeService.registrarResgate('abc999', 50, 'Desconto');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });

    it('deve lançar erro quando usuário não tem consentimento LGPD', async () => {
      mockModels.usuario.findById.resolves({ _id: 'abc123', consentimentoLgpd: false });
      mockModels.fidelidade.findOne.resolves(null);

      try {
        await fidelidadeService.registrarResgate('abc123', 50, 'Desconto');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(409);
        expect(erro.message).to.include('LGPD');
      }
    });

    it('deve lançar erro quando fidelidade não existe', async () => {
      mockModels.usuario.findById.resolves({ _id: 'abc123', consentimentoLgpd: true });
      mockModels.fidelidade.findOne.resolves(null);

      try {
        await fidelidadeService.registrarResgate('abc123', 50, 'Desconto');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(409);
      }
    });
  });
});

describe('EstoqueService - Unit', () => {
  afterEach(() => {
    Object.values(mockModels).forEach((modelo: any) => {
      if (typeof modelo === 'object' && modelo !== null) {
        Object.values(modelo).forEach((metodo: any) => {
          if (typeof metodo?.reset === 'function') {
            metodo.reset();
          }
        });
      }
    });
  });

  describe('consultarEstoque', () => {
    it('deve consultar com filtro de produtoId', async () => {
      mockModels.estoque.find.resolves([]);

      const resultado = await estoqueService.consultarEstoque('uid1', 'pid2');

      expect(resultado).to.be.an('array');
    });
  });

  describe('registrarMovimentacao', () => {
    it('deve criar estoque quando não existe', async () => {
      mockModels.estoque.findOne.resolves(null);
      mockModels.estoque.create.resolves({ _id: 'est1', produtoId: 'p1', unidadeId: 'u1', quantidade: 0 } as any);
      mockModels.estoque.findByIdAndUpdate.resolves({ _id: 'est1', quantidade: 5 } as any);
      mockModels.movimentacaoEstoque.create.resolves({ _id: 'mov1', tipo: 'ENTRADA', quantidade: 5 } as any);
      mockModels.logAuditoria.create.resolves({} as any);

      const resultado = await estoqueService.registrarMovimentacao({
        produtoId: 'p1', unidadeId: 'u1', tipo: 'ENTRADA', quantidade: 5, usuarioId: 'usr1'
      });

      expect(resultado).to.have.property('tipo', 'ENTRADA');
    });

    it('deve registrar saída de estoque', async () => {
      mockModels.estoque.findOne.resolves({ _id: 'est1', produtoId: 'p1', unidadeId: 'u1', quantidade: 10 } as any);
      mockModels.estoque.findByIdAndUpdate.resolves({ _id: 'est1', quantidade: 5 } as any);
      mockModels.movimentacaoEstoque.create.resolves({ _id: 'mov1', tipo: 'SAIDA', quantidade: 5 } as any);

      const resultado = await estoqueService.registrarMovimentacao({
        produtoId: 'p1', unidadeId: 'u1', tipo: 'SAIDA', quantidade: 5
      });

      expect(resultado).to.have.property('tipo', 'SAIDA');
    });
  });
});

describe('PedidoService - Unit', () => {
  afterEach(() => {
    Object.values(mockModels).forEach((modelo: any) => {
      if (typeof modelo === 'object' && modelo !== null) {
        Object.values(modelo).forEach((metodo: any) => {
          if (typeof metodo?.reset === 'function') {
            metodo.reset();
          }
        });
      }
    });
  });

  describe('buscarPedido', () => {
    it('deve lançar 404 quando pedido não existe', async () => {
      mockModels.pedido.findById.resolves(null);

      try {
        await pedidoService.buscarPedido('abc999');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });
  });

  describe('atualizarStatusPedido', () => {
    it('deve permitir cancelamento de qualquer status', async () => {
      mockModels.pedido.findById.resolves({ _id: 'ped1', status: 'EM_PREPARO', itens: [] });
      mockModels.pedido.findByIdAndUpdate.resolves({ _id: 'ped1', status: 'CANCELADO' } as any);
      mockModels.logAuditoria.create.resolves({} as any);

      const resultado = await pedidoService.atualizarStatusPedido('ped1', 'CANCELADO', 'usr1');

      expect(resultado).to.have.property('status', 'CANCELADO');
    });

    it('deve lançar erro para transição inválida de ENTREGUE', async () => {
      mockModels.pedido.findById.resolves({ _id: 'ped1', status: 'ENTREGUE', itens: [] });

      try {
        await pedidoService.atualizarStatusPedido('ped1', 'EM_PREPARO', 'usr1');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(409);
      }
    });

    it('deve lançar erro para transição não permitida entre estados não-terminais', async () => {
      mockModels.pedido.findById.resolves({ _id: 'ped1', status: 'AGUARDANDO_PAGAMENTO', itens: [] });

      try {
        await pedidoService.atualizarStatusPedido('ped1', 'EM_PREPARO', 'usr1');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(409);
        expect(erro.message).to.include('não permitida');
      }
    });
  });

  describe('criarPedido', () => {
    it('deve lançar 404 quando produto não existe', async () => {
      mockModels.estoque.findOne.resolves({ _id: 'est1', quantidade: 10 } as any);
      mockModels.produto.findById.resolves(null);

      try {
        await pedidoService.criarPedido({
          usuarioId: 'usr1', unidadeId: 'uid1', canalPedido: 'APP',
          itens: [{ produtoId: 'pid1', quantidade: 1 }], formaPagamento: 'PIX'
        });
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });
  });
});

describe('ProdutoService - Unit', () => {
  afterEach(() => {
    Object.values(mockModels).forEach((modelo: any) => {
      if (typeof modelo === 'object' && modelo !== null) {
        Object.values(modelo).forEach((metodo: any) => {
          if (typeof metodo?.reset === 'function') {
            metodo.reset();
          }
        });
      }
    });
  });

  describe('atualizarProduto', () => {
    it('deve atualizar apenas nome e preco quando descricao e categoriaId não informados', async () => {
      mockModels.produto.findById.resolves({ _id: 'pid1', nome: 'Tapioca', preco: 10 } as any);
      mockModels.produto.findByIdAndUpdate.resolves({ _id: 'pid1', nome: 'Cuscuz', preco: 12 } as any);

      const resultado = await produtoService.atualizarProduto('pid1', { nome: 'Cuscuz', preco: 12 });

      expect(resultado).to.have.property('nome', 'Cuscuz');
    });

    it('deve atualizar descricao e categoriaId quando informados', async () => {
      mockModels.produto.findById.resolves({ _id: 'pid1', nome: 'Tapioca', preco: 10 } as any);
      mockModels.produto.findByIdAndUpdate.resolves({ _id: 'pid1', nome: 'Tapioca', descricao: 'Nova', categoriaId: 'cat2' } as any);

      const resultado = await produtoService.atualizarProduto('pid1', { descricao: 'Nova', categoriaId: 'cat2' });

      expect(resultado).to.have.property('descricao', 'Nova');
    });
  });
});

describe('LogRepository - Unit', () => {
  afterEach(() => {
    Object.values(mockModels).forEach((modelo: any) => {
      if (typeof modelo === 'object' && modelo !== null) {
        Object.values(modelo).forEach((metodo: any) => {
          if (typeof metodo?.reset === 'function') {
            metodo.reset();
          }
        });
      }
    });
  });

  it('deve registrar log sem entidadeId', async () => {
    mockModels.logAuditoria.create.resolves({} as any);

    await registrarLog({
      usuarioId: 'usr1',
      acao: 'TESTE',
      entidade: 'Teste'
    });

    expect(mockModels.logAuditoria.create.calledOnce).to.be.true;
  });

  it('deve registrar log sem detalhes', async () => {
    mockModels.logAuditoria.create.resolves({} as any);

    await registrarLog({
      usuarioId: 'usr1',
      acao: 'TESTE',
      entidade: 'Teste',
      entidadeId: 'ent5'
    });

    expect(mockModels.logAuditoria.create.calledOnce).to.be.true;
  });
});
