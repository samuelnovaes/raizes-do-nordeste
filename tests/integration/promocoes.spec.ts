import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

const gerarToken = (perfil = 'ADMIN') => {
  return jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@email.com', perfil },
    'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Promoções - Integração', () => {
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

  describe('GET /api/v1/promocoes', () => {
    it('deve listar promoções ativas', async () => {
      mockModels.promocao.find.resolves([
        { _id: 'promo1', nome: 'Promo Teste', tipo: 'PERCENTUAL', valor: 10, ativo: true }
      ]);

      const res = await request(app).get('/api/v1/promocoes');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
      expect(res.body.dados).to.be.an('array');
    });

    it('deve filtrar por unidadeId', async () => {
      mockModels.promocao.find.resolves([]);

      const res = await request(app).get('/api/v1/promocoes?unidadeId=uid1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
    });

    it('deve filtrar por canalPedido', async () => {
      mockModels.promocao.find.resolves([]);

      const res = await request(app).get('/api/v1/promocoes?canalPedido=APP');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
    });

    it('deve filtrar por produtoId', async () => {
      mockModels.promocao.find.resolves([]);

      const res = await request(app).get('/api/v1/promocoes?produtoId=pid1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
    });

    it('deve tratar erro interno ao listar promoções', async () => {
      mockModels.promocao.find.rejects(new Error('Erro de banco'));

      const res = await request(app).get('/api/v1/promocoes');

      expect(res.status).to.equal(500);
    });
  });

  describe('GET /api/v1/promocoes/:id', () => {
    it('deve buscar promoção por ID', async () => {
      mockModels.promocao.findById.resolves({
        _id: 'promo1', nome: 'Promo Teste', tipo: 'PERCENTUAL', valor: 10
      });

      const res = await request(app).get('/api/v1/promocoes/promo1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'Promo Teste');
    });

    it('deve retornar 404 para promoção inexistente', async () => {
      mockModels.promocao.findById.resolves(null);

      const res = await request(app).get('/api/v1/promocoes/inexistente');

      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/v1/promocoes', () => {
    it('deve criar promoção como ADMIN', async () => {
      mockModels.promocao.create.resolves({
        _id: 'promo1', nome: 'Promo Teste', descricao: 'Descrição da promoção',
        tipo: 'PERCENTUAL', valor: 10, ativo: true
      });

      const res = await request(app)
        .post('/api/v1/promocoes')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`)
        .send({
          nome: 'Promo Teste',
          descricao: 'Descrição da promoção',
          tipo: 'PERCENTUAL',
          valor: 10,
          dataInicio: '2026-01-01T00:00:00.000Z',
          dataFim: '2026-12-31T23:59:59.000Z'
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('nome', 'Promo Teste');
    });

    it('deve criar promoção como GERENTE', async () => {
      mockModels.promocao.create.resolves({
        _id: 'promo2', nome: 'Promo Gerente', descricao: 'Promoção do gerente',
        tipo: 'VALOR_FIXO', valor: 5, ativo: true
      });

      const res = await request(app)
        .post('/api/v1/promocoes')
        .set('Authorization', `Bearer ${gerarToken('GERENTE')}`)
        .send({
          nome: 'Promo Gerente',
          descricao: 'Promoção do gerente',
          tipo: 'VALOR_FIXO',
          valor: 5,
          dataInicio: '2026-01-01T00:00:00.000Z',
          dataFim: '2026-12-31T23:59:59.000Z'
        });

      expect(res.status).to.equal(201);
    });

    it('deve rejeitar CLIENTE sem permissão', async () => {
      const res = await request(app)
        .post('/api/v1/promocoes')
        .set('Authorization', `Bearer ${gerarToken('CLIENTE')}`)
        .send({
          nome: 'Promo',
          descricao: 'Desc',
          tipo: 'PERCENTUAL',
          valor: 10,
          dataInicio: '2026-01-01T00:00:00.000Z',
          dataFim: '2026-12-31T23:59:59.000Z'
        });

      expect(res.status).to.equal(403);
    });

    it('deve rejeitar requisição sem autenticação', async () => {
      const res = await request(app)
        .post('/api/v1/promocoes')
        .send({
          nome: 'Promo',
          descricao: 'Desc',
          tipo: 'PERCENTUAL',
          valor: 10,
          dataInicio: '2026-01-01T00:00:00.000Z',
          dataFim: '2026-12-31T23:59:59.000Z'
        });

      expect(res.status).to.equal(401);
    });

    it('deve rejeitar dados inválidos', async () => {
      const res = await request(app)
        .post('/api/v1/promocoes')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`)
        .send({
          nome: 'P',
          tipo: 'INVALIDO',
          valor: -5
        });

      expect(res.status).to.equal(422);
    });

    it('deve tratar erro interno ao criar promoção', async () => {
      mockModels.promocao.create.rejects(new Error('Erro de banco'));

      const res = await request(app)
        .post('/api/v1/promocoes')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`)
        .send({
          nome: 'Promo Erro',
          descricao: 'Descrição',
          tipo: 'PERCENTUAL',
          valor: 10,
          dataInicio: '2026-01-01T00:00:00.000Z',
          dataFim: '2026-12-31T23:59:59.000Z'
        });

      expect(res.status).to.equal(500);
    });
  });

  describe('PUT /api/v1/promocoes/:id', () => {
    it('deve atualizar promoção como ADMIN', async () => {
      mockModels.promocao.findById.resolves({
        _id: 'promo1', nome: 'Promo Antiga', tipo: 'PERCENTUAL', valor: 10
      });
      mockModels.promocao.findByIdAndUpdate.resolves({
        _id: 'promo1', nome: 'Promo Atualizada', tipo: 'PERCENTUAL', valor: 15
      });

      const res = await request(app)
        .put('/api/v1/promocoes/promo1')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`)
        .send({ nome: 'Promo Atualizada', valor: 15 });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'Promo Atualizada');
    });

    it('deve retornar 404 ao atualizar promoção inexistente', async () => {
      mockModels.promocao.findById.resolves(null);

      const res = await request(app)
        .put('/api/v1/promocoes/inexistente')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`)
        .send({ nome: 'Teste' });

      expect(res.status).to.equal(404);
    });
  });

  describe('PATCH /api/v1/promocoes/:id/desativar', () => {
    it('deve desativar promoção como ADMIN', async () => {
      mockModels.promocao.findById.resolves({
        _id: 'promo1', nome: 'Promo Teste', ativo: true
      });
      mockModels.promocao.findByIdAndUpdate.resolves({
        _id: 'promo1', nome: 'Promo Teste', ativo: false
      });

      const res = await request(app)
        .patch('/api/v1/promocoes/promo1/desativar')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('ativo', false);
    });

    it('deve retornar 404 ao desativar promoção inexistente', async () => {
      mockModels.promocao.findById.resolves(null);

      const res = await request(app)
        .patch('/api/v1/promocoes/inexistente/desativar')
        .set('Authorization', `Bearer ${gerarToken('ADMIN')}`);

      expect(res.status).to.equal(404);
    });

    it('deve rejeitar CLIENTE sem permissão', async () => {
      const res = await request(app)
        .patch('/api/v1/promocoes/promo1/desativar')
        .set('Authorization', `Bearer ${gerarToken('CLIENTE')}`);

      expect(res.status).to.equal(403);
    });
  });
});
