import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

const gerarToken = (perfil = 'CLIENTE') => {
  return jwt.sign(
    { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@email.com', perfil },
    'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Pedidos - Integração', () => {
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

  describe('POST /api/v1/pedidos', () => {
    const pedidoValido = {
      unidadeId: '123e4567-e89b-12d3-a456-426614174001',
      canalPedido: 'TOTEM',
      itens: [{ produtoId: '123e4567-e89b-12d3-a456-426614174002', quantidade: 2 }],
      formaPagamento: 'PIX'
    };

    it('deve criar pedido com dados válidos', async () => {
      mockModels.estoque.findFirst.resolves({
        _id: 'est-1',
        produtoId: pedidoValido.itens[0].produtoId,
        unidadeId: pedidoValido.unidadeId,
        quantidade: 10
      });
      mockModels.produto.findUnique.resolves({
        _id: pedidoValido.itens[0].produtoId,
        nome: 'Tapioca',
        preco: 15.0
      });
      mockModels.estoque.update.resolves({});
      mockModels.movimentacaoEstoque.create.resolves({ _id: 'mov-1', tipo: 'SAIDA', quantidade: 2 });
      mockModels.logAuditoria.create.resolves({});
      mockModels.pedido.create.resolves({
        _id: 'pedido-1',
        usuarioId: '123e4567-e89b-12d3-a456-426614174000',
        unidadeId: pedidoValido.unidadeId,
        canalPedido: 'TOTEM',
        formaPagamento: 'PIX',
        status: 'AGUARDANDO_PAGAMENTO',
        total: 30.0,
        itens: [{ produtoId: pedidoValido.itens[0].produtoId, quantidade: 2 }],
        criadoEm: new Date(),
        atualizadoEm: new Date()
      });

      const res = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send(pedidoValido);

      expect(res.status).to.equal(201);
    });

    it('deve retornar 422 quando canalPedido não é informado', async () => {
      const { canalPedido, ...semCanal } = pedidoValido;

      const res = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send(semCanal);

      expect(res.status).to.equal(422);
    });

    it('deve retornar 422 quando canalPedido é inválido', async () => {
      const res = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ ...pedidoValido, canalPedido: 'INVALIDO' });

      expect(res.status).to.equal(422);
    });

    it('deve retornar 404 quando unidade não existe', async () => {
      mockModels.estoque.findFirst.resolves(null);

      const res = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send(pedidoValido);

      expect(res.status).to.equal(409);
    });

    it('deve retornar 409 quando estoque é insuficiente', async () => {
      mockModels.estoque.findFirst.resolves({
        _id: 'est-1',
        produtoId: pedidoValido.itens[0].produtoId,
        unidadeId: pedidoValido.unidadeId,
        quantidade: 1
      });

      const res = await request(app)
        .post('/api/v1/pedidos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send(pedidoValido);

      expect(res.status).to.equal(409);
    });
  });

  describe('GET /api/v1/pedidos', () => {
    it('deve listar pedidos com filtro por canalPedido', async () => {
      mockModels.pedido.find.resolves([]);
      mockModels.pedido.countDocuments.resolves(0);

      const res = await request(app)
        .get('/api/v1/pedidos?canalPedido=TOTEM')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
    });

    it('deve listar pedidos com filtro por status e unidadeId', async () => {
      mockModels.pedido.find.resolves([]);
      mockModels.pedido.countDocuments.resolves(0);

      const res = await request(app)
        .get('/api/v1/pedidos?status=PAGO&unidadeId=1&page=2&limit=5')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('pagina', 2);
    });

    it('deve retornar 500 quando ocorre erro no serviço', async () => {
      mockModels.pedido.find.rejects(new Error('DB error'));

      const res = await request(app)
        .get('/api/v1/pedidos')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(500);
    });

    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .get('/api/v1/pedidos');

      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/v1/pedidos/:id', () => {
    it('deve buscar pedido por ID', async () => {
      mockModels.pedido.findUnique.resolves({
        id: 1, status: 'PAGO', itens: [{ produtoId: 1, quantidade: 2 }]
      });

      const res = await request(app)
        .get('/api/v1/pedidos/1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(200);
    });

    it('deve retornar 404 quando pedido não existe', async () => {
      mockModels.pedido.findUnique.resolves(null);

      const res = await request(app)
        .get('/api/v1/pedidos/999')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(res.status).to.equal(404);
    });
  });

  describe('PATCH /api/v1/pedidos/:id/status', () => {
    it('deve atualizar status do pedido', async () => {
      mockModels.pedido.findUnique.resolves({
        id: 'pedido-1',
        status: 'PAGO',
        usuarioId: '123e4567-e89b-12d3-a456-426614174000',
        itens: []
      });
      mockModels.pedido.update.resolves({
        id: 'pedido-1',
        status: 'EM_PREPARO'
      });
      mockModels.logAuditoria.create.resolves({});

      const res = await request(app)
        .patch('/api/v1/pedidos/pedido-1/status')
        .set('Authorization', `Bearer ${gerarToken('GERENTE')}`)
        .send({ status: 'EM_PREPARO' });

      expect(res.status).to.equal(200);
    });

    it('deve retornar 409 para transição inválida', async () => {
      mockModels.pedido.findUnique.resolves({
        id: 'pedido-1',
        status: 'ENTREGUE',
        usuarioId: '123e4567-e89b-12d3-a456-426614174000',
        itens: []
      });

      const res = await request(app)
        .patch('/api/v1/pedidos/pedido-1/status')
        .set('Authorization', `Bearer ${gerarToken('GERENTE')}`)
        .send({ status: 'EM_PREPARO' });

      expect(res.status).to.equal(409);
    });
  });
});
