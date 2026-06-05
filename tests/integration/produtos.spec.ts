import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

const gerarToken = (perfil = 'GERENTE') => {
  return jwt.sign(
    { id: '507f1f77bcf86cd799439000', email: 'test@email.com', perfil },
    'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Produtos - Integração', () => {
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

  describe('GET /api/v1/produtos', () => {
    it('deve listar produtos com paginação', async () => {
      mockModels.produto.find.resolves([
        { id: 1, nome: 'Tapioca', preco: 10.0 }
      ]);
      mockModels.produto.countDocuments.resolves(1);

      const res = await request(app).get('/api/v1/produtos');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
      expect(res.body).to.have.property('total', 1);
      expect(res.body).to.have.property('pagina', 1);
    });

    it('deve filtrar por nome e categoria', async () => {
      mockModels.categoria.findOne.resolves({ _id: 'cat-1', nome: 'Lanches' });
      mockModels.produto.find.resolves([]);
      mockModels.produto.countDocuments.resolves(0);

      const res = await request(app).get('/api/v1/produtos?nome=Tapioca&categoria=Lanches&page=2&limit=5');

      expect(res.status).to.equal(200);
      expect(res.body.pagina).to.equal(2);
    });

    it('deve retornar 500 quando ocorre erro no serviço', async () => {
      mockModels.produto.find.rejects(new Error('DB error'));

      const res = await request(app).get('/api/v1/produtos');

      expect(res.status).to.equal(500);
    });
  });

  describe('GET /api/v1/produtos/:id', () => {
    it('deve buscar produto por ID', async () => {
      mockModels.produto.findUnique.resolves({ id: 1, nome: 'Tapioca', preco: 10.0 });

      const res = await request(app).get('/api/v1/produtos/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'Tapioca');
    });

    it('deve retornar 404 quando produto não existe', async () => {
      mockModels.produto.findUnique.resolves(null);

      const res = await request(app).get('/api/v1/produtos/999');

      expect(res.status).to.equal(404);
    });
  });

  describe('GET /api/v1/produtos/cardapio/:unidadeId', () => {
    it('deve listar cardápio por unidade', async () => {
      mockModels.estoque.find.resolves([
        { produtoId: { id: 1, nome: 'Tapioca', preco: 10.0, toObject() { return { id: 1, nome: 'Tapioca', preco: 10.0 }; } }, quantidade: 5 }
      ]);

      const res = await request(app).get('/api/v1/produtos/cardapio/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('quantidadeDisponivel', 5);
    });

    it('deve retornar 500 quando ocorre erro', async () => {
      mockModels.estoque.find.rejects(new Error('DB error'));

      const res = await request(app).get('/api/v1/produtos/cardapio/1');

      expect(res.status).to.equal(500);
    });
  });

  describe('POST /api/v1/produtos', () => {
    it('deve criar produto com dados válidos', async () => {
      mockModels.produto.create.resolves({
        id: 1, nome: 'Cuscuz', descricao: 'Cuscuz nordestino', preco: 8.0, categoriaId: 1
      });

      const res = await request(app)
        .post('/api/v1/produtos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Cuscuz', descricao: 'Cuscuz nordestino', preco: 8.0 });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('nome', 'Cuscuz');
    });

    it('deve retornar 500 quando serviço falha', async () => {
      mockModels.produto.create.rejects(new Error('DB error'));

      const res = await request(app)
        .post('/api/v1/produtos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Cuscuz', descricao: 'Cuscuz nordestino', preco: 8.0 });

      expect(res.status).to.equal(500);
    });

    it('deve retornar 422 com dados inválidos', async () => {
      const res = await request(app)
        .post('/api/v1/produtos')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'C' });

      expect(res.status).to.equal(422);
    });

    it('deve retornar 403 para CLIENTE', async () => {
      const res = await request(app)
        .post('/api/v1/produtos')
        .set('Authorization', `Bearer ${gerarToken('CLIENTE')}`)
        .send({ nome: 'Cuscuz', preco: 8.0 });

      expect(res.status).to.equal(403);
    });
  });

  describe('PUT /api/v1/produtos/:id', () => {
    it('deve atualizar produto existente', async () => {
      mockModels.produto.findUnique.resolves({ id: 1, nome: 'Tapioca', preco: 10.0 });
      mockModels.produto.update.resolves({ id: 1, nome: 'Tapioca Premium', preco: 15.0 });

      const res = await request(app)
        .put('/api/v1/produtos/1')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Tapioca Premium', preco: 15.0 });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'Tapioca Premium');
    });

    it('deve retornar 404 quando produto não existe', async () => {
      mockModels.produto.findUnique.resolves(null);

      const res = await request(app)
        .put('/api/v1/produtos/999')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Novo Nome' });

      expect(res.status).to.equal(404);
    });
  });
});
