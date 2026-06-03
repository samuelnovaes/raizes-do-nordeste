import { expect } from 'chai';
import { mockModels } from '../helpers/setup';
import * as promocaoService from '../../src/application/services/promocaoService';

describe('PromocaoService - Unit', () => {
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

  describe('listarPromocoes', () => {
    it('deve listar promoções sem filtros', async () => {
      mockModels.promocao.find.resolves([
        { _id: 'promo1', nome: 'Promo 1', ativo: true }
      ]);

      const resultado = await promocaoService.listarPromocoes();

      expect(resultado).to.have.property('dados');
      expect(resultado.dados).to.be.an('array');
    });

    it('deve listar promoções com filtro de unidadeId', async () => {
      mockModels.promocao.find.resolves([]);

      const resultado = await promocaoService.listarPromocoes({ unidadeId: 'uid1' });

      expect(resultado).to.have.property('dados');
      expect(resultado.dados).to.be.an('array');
    });

    it('deve listar promoções com filtro de canalPedido', async () => {
      mockModels.promocao.find.resolves([]);

      const resultado = await promocaoService.listarPromocoes({ canalPedido: 'APP' });

      expect(resultado).to.have.property('dados');
    });

    it('deve listar promoções com filtro de produtoId', async () => {
      mockModels.promocao.find.resolves([]);

      const resultado = await promocaoService.listarPromocoes({ produtoId: 'pid1' });

      expect(resultado).to.have.property('dados');
    });

    it('deve listar promoções com todos os filtros combinados', async () => {
      mockModels.promocao.find.resolves([]);

      const resultado = await promocaoService.listarPromocoes({
        unidadeId: 'uid1',
        canalPedido: 'TOTEM',
        produtoId: 'pid1'
      });

      expect(resultado).to.have.property('dados');
    });
  });

  describe('buscarPromocao', () => {
    it('deve retornar promoção existente', async () => {
      mockModels.promocao.findById.resolves({
        _id: 'promo1', nome: 'Promo Teste', tipo: 'PERCENTUAL', valor: 10
      });

      const resultado = await promocaoService.buscarPromocao('promo1');

      expect(resultado).to.have.property('nome', 'Promo Teste');
    });

    it('deve lançar 404 quando promoção não existe', async () => {
      mockModels.promocao.findById.resolves(null);

      try {
        await promocaoService.buscarPromocao('inexistente');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });
  });

  describe('criarPromocao', () => {
    it('deve criar promoção com dados obrigatórios', async () => {
      mockModels.promocao.create.resolves({
        _id: 'promo1', nome: 'Promo Teste', descricao: 'Descrição',
        tipo: 'PERCENTUAL', valor: 10, ativo: true
      });

      const resultado = await promocaoService.criarPromocao({
        nome: 'Promo Teste',
        descricao: 'Descrição',
        tipo: 'PERCENTUAL',
        valor: 10,
        dataInicio: '2026-01-01T00:00:00.000Z',
        dataFim: '2026-12-31T23:59:59.000Z'
      });

      expect(resultado).to.have.property('nome', 'Promo Teste');
      expect(resultado).to.have.property('ativo', true);
    });

    it('deve criar promoção com campos opcionais', async () => {
      mockModels.promocao.create.resolves({
        _id: 'promo2', nome: 'Promo Específica', tipo: 'VALOR_FIXO',
        valor: 5, unidadeId: 'uid1', canalPedido: 'APP', produtoId: 'pid1', ativo: true
      });

      const resultado = await promocaoService.criarPromocao({
        nome: 'Promo Específica',
        descricao: 'Para unidade específica',
        tipo: 'VALOR_FIXO',
        valor: 5,
        dataInicio: '2026-01-01T00:00:00.000Z',
        dataFim: '2026-12-31T23:59:59.000Z',
        unidadeId: 'uid1',
        canalPedido: 'APP',
        produtoId: 'pid1'
      });

      expect(resultado).to.have.property('unidadeId', 'uid1');
      expect(resultado).to.have.property('canalPedido', 'APP');
    });

    it('deve criar promoção com ativo explicitamente false', async () => {
      mockModels.promocao.create.resolves({
        _id: 'promo3', nome: 'Promo Inativa', tipo: 'LEVE_PAGUE',
        valor: 2, ativo: false
      });

      const resultado = await promocaoService.criarPromocao({
        nome: 'Promo Inativa',
        descricao: 'Inativa',
        tipo: 'LEVE_PAGUE',
        valor: 2,
        dataInicio: '2026-01-01T00:00:00.000Z',
        dataFim: '2026-12-31T23:59:59.000Z',
        ativo: false
      });

      expect(resultado).to.have.property('ativo', false);
    });
  });

  describe('atualizarPromocao', () => {
    it('deve atualizar promoção existente', async () => {
      mockModels.promocao.findById.resolves({
        _id: 'promo1', nome: 'Promo Antiga', tipo: 'PERCENTUAL', valor: 10
      });
      mockModels.promocao.findByIdAndUpdate.resolves({
        _id: 'promo1', nome: 'Promo Nova', tipo: 'PERCENTUAL', valor: 15
      });

      const resultado = await promocaoService.atualizarPromocao('promo1', {
        nome: 'Promo Nova', valor: 15
      });

      expect(resultado).to.have.property('nome', 'Promo Nova');
      expect(resultado).to.have.property('valor', 15);
    });

    it('deve lançar 404 ao atualizar promoção inexistente', async () => {
      mockModels.promocao.findById.resolves(null);

      try {
        await promocaoService.atualizarPromocao('inexistente', { nome: 'Teste' });
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });

    it('deve atualizar todos os campos opcionais', async () => {
      mockModels.promocao.findById.resolves({ _id: 'promo1', nome: 'Promo', tipo: 'PERCENTUAL' });
      mockModels.promocao.findByIdAndUpdate.resolves({
        _id: 'promo1', nome: 'Promo Atualizada', descricao: 'Nova desc',
        tipo: 'VALOR_FIXO', valor: 20, canalPedido: 'TOTEM', ativo: false
      });

      const resultado = await promocaoService.atualizarPromocao('promo1', {
        nome: 'Promo Atualizada',
        descricao: 'Nova desc',
        tipo: 'VALOR_FIXO',
        valor: 20,
        dataInicio: '2026-06-01T00:00:00.000Z',
        dataFim: '2026-12-31T23:59:59.000Z',
        unidadeId: 'uid2',
        produtoId: 'pid2',
        canalPedido: 'TOTEM',
        ativo: false
      });

      expect(resultado).to.have.property('nome', 'Promo Atualizada');
      expect(resultado).to.have.property('tipo', 'VALOR_FIXO');
    });
  });

  describe('desativarPromocao', () => {
    it('deve desativar promoção existente', async () => {
      mockModels.promocao.findById.resolves({
        _id: 'promo1', nome: 'Promo Ativa', ativo: true
      });
      mockModels.promocao.findByIdAndUpdate.resolves({
        _id: 'promo1', nome: 'Promo Ativa', ativo: false
      });

      const resultado = await promocaoService.desativarPromocao('promo1');

      expect(resultado).to.have.property('ativo', false);
    });

    it('deve lançar 404 ao desativar promoção inexistente', async () => {
      mockModels.promocao.findById.resolves(null);

      try {
        await promocaoService.desativarPromocao('inexistente');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.statusCode).to.equal(404);
      }
    });
  });
});
