import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

const gerarToken = () => {
  return jwt.sign(
    { id: '507f1f77bcf86cd799439000', email: 'test@email.com', perfil: 'CLIENTE' },
    'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Fidelidade - Integração', () => {
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

  describe('GET /api/v1/fidelidade/pontos', () => {
    it('deve retornar pontos do cliente', async () => {
      mockModels.fidelidade.findOne.resolves({
        id: 'fid-1',
        usuarioId: '507f1f77bcf86cd799439000',
        pontos: 150
      });

      const res = await request(app)
        .get('/api/v1/fidelidade/pontos')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('pontos', 150);
    });

    it('deve retornar 500 quando ocorre erro', async () => {
      mockModels.fidelidade.findOne.rejects(new Error('DB error'));

      const res = await request(app)
        .get('/api/v1/fidelidade/pontos')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(500);
    });
  });

  describe('POST /api/v1/fidelidade/resgate', () => {
    it('deve resgatar pontos com sucesso', async () => {
      mockModels.usuario.findById.resolves({
        _id: '507f1f77bcf86cd799439000',
        consentimentoLgpd: true
      });
      mockModels.fidelidade.findOne.resolves({
        _id: 'fid-1',
        usuarioId: '507f1f77bcf86cd799439000',
        pontos: 100
      });
      mockModels.fidelidade.findOneAndUpdate.resolves({
        _id: 'fid-1',
        usuarioId: '507f1f77bcf86cd799439000',
        pontos: 50
      });
      mockModels.logAuditoria.create.resolves({});

      const res = await request(app)
        .post('/api/v1/fidelidade/resgate')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ pontos: 50, descricao: 'Desconto em pedido' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('pontos', 50);
    });

    it('deve retornar 409 quando pontos insuficientes', async () => {
      mockModels.usuario.findById.resolves({
        _id: '507f1f77bcf86cd799439000',
        consentimentoLgpd: true
      });
      mockModels.fidelidade.findOne.resolves({
        id: 'fid-1',
        usuarioId: '507f1f77bcf86cd799439000',
        pontos: 10
      });

      const res = await request(app)
        .post('/api/v1/fidelidade/resgate')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ pontos: 50, descricao: 'Desconto em pedido' });

      expect(res.status).to.equal(409);
    });
  });
});
