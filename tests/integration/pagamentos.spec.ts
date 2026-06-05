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

describe('Pagamentos - Integração', () => {
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

  describe('POST /api/v1/pagamentos', () => {
    it('deve processar pagamento com sucesso (aprovado)', async () => {
      mockModels.pedido.findUnique.resolves({
        _id: '507f1f77bcf86cd799439001',
        total: 50.0,
        usuarioId: '507f1f77bcf86cd799439000',
        status: 'AGUARDANDO_PAGAMENTO'
      });
      mockModels.pagamento.create.resolves({
        _id: 'pag-1',
        pedidoId: '507f1f77bcf86cd799439001',
        metodo: 'PIX',
        valor: 50.0,
        status: 'APROVADO',
        transacaoId: 'uuid-123'
      });
      mockModels.pedido.update.resolves({});
      mockModels.logAuditoria.create.resolves({});

      const res = await request(app)
        .post('/api/v1/pagamentos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ pedidoId: '507f1f77bcf86cd799439001', metodo: 'PIX' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('APROVADO');
    });

    it('deve processar pagamento recusado', async () => {
      mockModels.pedido.findUnique.resolves({
        _id: '507f1f77bcf86cd799439001',
        total: 50.0,
        usuarioId: '507f1f77bcf86cd799439000',
        status: 'AGUARDANDO_PAGAMENTO'
      });
      mockModels.pagamento.create.resolves({
        _id: 'pag-1',
        pedidoId: '507f1f77bcf86cd799439001',
        metodo: 'RECUSADO',
        valor: 50.0,
        status: 'RECUSADO',
        transacaoId: null
      });
      mockModels.logAuditoria.create.resolves({});

      const res = await request(app)
        .post('/api/v1/pagamentos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ pedidoId: '507f1f77bcf86cd799439001', metodo: 'RECUSADO' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('RECUSADO');
    });

    it('deve retornar 404 quando pedido não existe', async () => {
      mockModels.pedido.findUnique.resolves(null);

      const res = await request(app)
        .post('/api/v1/pagamentos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ pedidoId: '507f1f77bcf86cd799439099', metodo: 'PIX' });

      expect(res.status).to.equal(404);
    });
  });
});
