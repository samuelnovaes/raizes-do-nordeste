import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

describe('Auth - Integração', () => {
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

  describe('POST /api/v1/auth/registrar', () => {
    it('deve registrar usuário com dados válidos', async () => {
      mockModels.usuario.findOne.resolves(null);
      mockModels.usuario.create.resolves({
        _id: '507f1f77bcf86cd799439000',
        nome: 'João',
        email: 'joao@email.com',
        senha: 'hash',
        perfil: 'CLIENTE',
        consentimento: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        toObject() { return { _id: this._id, nome: this.nome, email: this.email, perfil: this.perfil }; }
      });
      mockModels.logAuditoria.create.resolves({});

      const res = await request(app)
        .post('/api/v1/auth/registrar')
        .send({ nome: 'João', email: 'joao@email.com', senha: '123456', consentimentoLgpd: true });

      expect(res.status).to.equal(201);
    });

    it('deve retornar 409 quando email já existe', async () => {
      mockModels.usuario.findOne.resolves({
        _id: '123',
        email: 'joao@email.com'
      });

      const res = await request(app)
        .post('/api/v1/auth/registrar')
        .send({ nome: 'João', email: 'joao@email.com', senha: '123456', consentimentoLgpd: true });

      expect(res.status).to.equal(409);
    });

    it('deve retornar 422 quando dados obrigatórios estão ausentes', async () => {
      const res = await request(app)
        .post('/api/v1/auth/registrar')
        .send({ nome: 'João' });

      expect(res.status).to.equal(422);
    });
  });

  describe('GET /api/v1/auth/perfil', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439000', email: 'joao@email.com', perfil: 'CLIENTE' },
        'test-secret',
        { expiresIn: '1h' }
      );
      mockModels.usuario.findById.resolves({
        _id: '507f1f77bcf86cd799439000',
        nome: 'João',
        email: 'joao@email.com',
        perfil: 'CLIENTE'
      });

      const res = await request(app)
        .get('/api/v1/auth/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'João');
    });

    it('deve retornar 404 quando usuário não existe', async () => {
      const token = jwt.sign(
        { id: 'inexistente', email: 'x@email.com', perfil: 'CLIENTE' },
        'test-secret',
        { expiresIn: '1h' }
      );
      mockModels.usuario.findById.resolves(null);

      const res = await request(app)
        .get('/api/v1/auth/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('deve renovar token com refresh token válido', async () => {
      const token = jwt.sign(
        { id: 1, email: 'joao@email.com', perfil: 'CLIENTE' },
        'test-secret',
        { expiresIn: '7d' }
      );

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ token });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ token: 'token-invalido' });

      expect(res.status).to.equal(401);
    });

    it('deve retornar 422 sem token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(res.status).to.equal(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const senhaHash = await bcrypt.hash('123456', 10);
      mockModels.usuario.findOne.resolves({
        _id: '507f1f77bcf86cd799439000',
        nome: 'João',
        email: 'joao@email.com',
        senha: senhaHash,
        perfil: 'CLIENTE',
        criadoEm: new Date(),
        atualizadoEm: new Date()
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'joao@email.com', senha: '123456' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('deve retornar 401 com credenciais inválidas (usuário não existe)', async () => {
      mockModels.usuario.findOne.resolves(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'joao@email.com', senha: 'errada' });

      expect(res.status).to.equal(401);
    });

    it('deve retornar 401 com senha incorreta', async () => {
      const senhaHash = await bcrypt.hash('123456', 10);
      mockModels.usuario.findOne.resolves({
        _id: '1',
        email: 'joao@email.com',
        senha: senhaHash,
        perfil: 'CLIENTE'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'joao@email.com', senha: 'senha-errada' });

      expect(res.status).to.equal(401);
    });

    it('deve retornar 422 sem email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ senha: '123456' });

      expect(res.status).to.equal(422);
    });
  });
});
