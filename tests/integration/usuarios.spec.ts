import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup.ts';
import { app } from '../../src/app.ts';

describe('Usuários - Integração', () => {
  const adminToken = jwt.sign(
    { id: 'admin-id', email: 'admin@email.com', perfil: 'ADMIN' },
    'test-secret',
    { expiresIn: '1h' }
  );

  const clienteToken = jwt.sign(
    { id: 'cliente-id', email: 'cliente@email.com', perfil: 'CLIENTE' },
    'test-secret',
    { expiresIn: '1h' }
  );

  const gerenteToken = jwt.sign(
    { id: 'gerente-id', email: 'gerente@email.com', perfil: 'GERENTE' },
    'test-secret',
    { expiresIn: '1h' }
  );

  afterEach(() => {
    sinon.resetBehavior();
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

  describe('GET /api/v1/usuarios', () => {
    it('deve listar usuários quando autenticado como ADMIN', async () => {
      const usuarios = [
        { _id: '1', nome: 'Admin', email: 'admin@email.com', perfil: 'ADMIN' },
        { _id: '2', nome: 'Cliente', email: 'cliente@email.com', perfil: 'CLIENTE' }
      ];
      mockModels.usuario.find.resolves(usuarios);
      mockModels.usuario.countDocuments.resolves(2);

      const res = await request(app)
        .get('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('dados');
      expect(res.body).to.have.property('total', 2);
      expect(res.body).to.have.property('page', 1);
      expect(res.body).to.have.property('limit', 10);
      expect(res.body.dados).to.have.length(2);
    });

    it('deve respeitar parâmetros de paginação', async () => {
      mockModels.usuario.find.resolves([]);
      mockModels.usuario.countDocuments.resolves(0);

      const res = await request(app)
        .get('/api/v1/usuarios?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.page).to.equal(2);
      expect(res.body.limit).to.equal(5);
    });

    it('deve usar valores padrão para paginação inválida', async () => {
      mockModels.usuario.find.resolves([]);
      mockModels.usuario.countDocuments.resolves(0);

      const res = await request(app)
        .get('/api/v1/usuarios?page=0&limit=-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.page).to.equal(1);
      expect(res.body.limit).to.equal(1);
    });

    it('deve limitar o máximo de registros por página a 100', async () => {
      mockModels.usuario.find.resolves([]);
      mockModels.usuario.countDocuments.resolves(0);

      const res = await request(app)
        .get('/api/v1/usuarios?limit=200')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.limit).to.equal(100);
    });

    it('deve retornar 401 sem token de autenticação', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios');

      expect(res.status).to.equal(401);
    });

    it('deve retornar 403 quando perfil é CLIENTE', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).to.equal(403);
    });

    it('deve retornar 403 quando perfil é GERENTE', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios')
        .set('Authorization', `Bearer ${gerenteToken}`);

      expect(res.status).to.equal(403);
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).to.equal(401);
    });

    it('deve tratar erro interno ao listar usuários', async () => {
      mockModels.usuario.find.resolves([]);
      mockModels.usuario.countDocuments.rejects(new Error('Erro de banco'));

      const res = await request(app)
        .get('/api/v1/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(500);
    });
  });

  describe('GET /api/v1/usuarios/:id', () => {
    it('deve retornar usuário por ID quando autenticado como ADMIN', async () => {
      const usuario = {
        _id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'João',
        email: 'joao@email.com',
        perfil: 'CLIENTE'
      };
      mockModels.usuario.findById.resolves(usuario);

      const res = await request(app)
        .get('/api/v1/usuarios/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'João');
      expect(res.body).to.have.property('email', 'joao@email.com');
    });

    it('deve retornar 404 quando usuário não existe', async () => {
      mockModels.usuario.findById.resolves(null);

      const res = await request(app)
        .get('/api/v1/usuarios/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('deve retornar 401 sem token de autenticação', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios/123');

      expect(res.status).to.equal(401);
    });

    it('deve retornar 403 quando perfil é CLIENTE', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios/123')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).to.equal(403);
    });

    it('deve retornar 403 quando perfil é GERENTE', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios/123')
        .set('Authorization', `Bearer ${gerenteToken}`);

      expect(res.status).to.equal(403);
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .get('/api/v1/usuarios/123')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).to.equal(401);
    });

    it('deve tratar erro interno ao buscar usuário', async () => {
      mockModels.usuario.findById.rejects(new Error('Erro de banco'));

      const res = await request(app)
        .get('/api/v1/usuarios/123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(500);
    });
  });
});
