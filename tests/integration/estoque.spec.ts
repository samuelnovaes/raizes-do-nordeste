import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

const gerarToken = (perfil = 'GERENTE') => {
  return jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@email.com', perfil },
    'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Estoque - Integração', () => {
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

  describe('GET /api/v1/estoque/:unidadeId', () => {
    it('deve consultar estoque de uma unidade', async () => {
      mockModels.estoque.find.resolves([
        { id: 'est-1', produtoId: 'prod-1', unidadeId: 'uni-1', quantidade: 50, produto: { nome: 'Tapioca' } }
      ]);

      const res = await request(app)
        .get('/api/v1/estoque/uni-1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('deve consultar estoque com filtro de produtoId', async () => {
      mockModels.estoque.find.resolves([]);

      const res = await request(app)
        .get('/api/v1/estoque/uni-1?produtoId=prod-1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(200);
    });

    it('deve retornar 500 quando ocorre erro', async () => {
      mockModels.estoque.find.rejects(new Error('DB error'));

      const res = await request(app)
        .get('/api/v1/estoque/uni-1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(500);
    });

    it('deve retornar 401 sem autenticação', async () => {
      const res = await request(app)
        .get('/api/v1/estoque/uni-1');

      expect(res.status).to.equal(401);
    });
  });

  describe('POST /api/v1/estoque/movimentacao', () => {
    it('deve registrar entrada de estoque', async () => {
      mockModels.estoque.findFirst.resolves({
        _id: 'est-1',
        produtoId: '123e4567-e89b-12d3-a456-426614174002',
        unidadeId: '123e4567-e89b-12d3-a456-426614174001',
        quantidade: 10
      });
      mockModels.estoque.update.resolves({});
      mockModels.movimentacaoEstoque.create.resolves({
        id: 'mov-1',
        produtoId: '123e4567-e89b-12d3-a456-426614174002',
        unidadeId: '123e4567-e89b-12d3-a456-426614174001',
        tipo: 'ENTRADA',
        quantidade: 5,
        motivo: 'Reposição'
      });
      mockModels.logAuditoria.create.resolves({});

      const res = await request(app)
        .post('/api/v1/estoque/movimentacao')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({
          produtoId: '123e4567-e89b-12d3-a456-426614174002',
          unidadeId: '123e4567-e89b-12d3-a456-426614174001',
          tipo: 'ENTRADA',
          quantidade: 5,
          motivo: 'Reposição'
        });

      expect(res.status).to.equal(201);
    });

    it('deve retornar 409 para saída com estoque insuficiente', async () => {
      mockModels.estoque.findFirst.resolves({
        _id: 'est-1',
        produtoId: '123e4567-e89b-12d3-a456-426614174002',
        unidadeId: '123e4567-e89b-12d3-a456-426614174001',
        quantidade: 2
      });

      const res = await request(app)
        .post('/api/v1/estoque/movimentacao')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({
          produtoId: '123e4567-e89b-12d3-a456-426614174002',
          unidadeId: '123e4567-e89b-12d3-a456-426614174001',
          tipo: 'SAIDA',
          quantidade: 10
        });

      expect(res.status).to.equal(409);
    });
  });
});
