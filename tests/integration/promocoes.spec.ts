import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup.ts';
import { app } from '../../src/app.ts';

const gerarToken = (perfil = 'ADMIN') => {
  return jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@email.com', perfil },
    'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Promoções - Integração', () => {
  describe('GET /api/v1/promocoes', () => {
    it('deve listar promoções', async () => {
      const res = await request(app).get('/api/v1/promocoes');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
      expect(res.body).to.have.property('mensagem');
    });
  });

  describe('POST /api/v1/promocoes', () => {
    it('deve criar promoção como ADMIN', async () => {
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
      expect(res.body).to.have.property('mensagem');
    });

    it('deve criar promoção como GERENTE', async () => {
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
  });
});
