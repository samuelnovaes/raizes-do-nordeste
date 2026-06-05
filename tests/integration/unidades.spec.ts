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

describe('Unidades - Integração', () => {
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

  describe('GET /api/v1/unidades', () => {
    it('deve listar unidades', async () => {
      mockModels.unidade.find.resolves([
        { id: 1, nome: 'Unidade Centro', cidade: 'Recife', estado: 'PE' }
      ]);

      const res = await request(app).get('/api/v1/unidades');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('deve filtrar por nome e cidade', async () => {
      mockModels.unidade.find.resolves([]);

      const res = await request(app).get('/api/v1/unidades?nome=Centro&cidade=Recife');

      expect(res.status).to.equal(200);
    });

    it('deve retornar 500 quando ocorre erro', async () => {
      mockModels.unidade.find.rejects(new Error('DB error'));

      const res = await request(app).get('/api/v1/unidades');

      expect(res.status).to.equal(500);
    });
  });

  describe('GET /api/v1/unidades/:id', () => {
    it('deve buscar unidade por ID', async () => {
      mockModels.unidade.findUnique.resolves({ id: 1, nome: 'Unidade Centro', cidade: 'Recife' });

      const res = await request(app).get('/api/v1/unidades/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'Unidade Centro');
    });

    it('deve retornar 404 quando unidade não existe', async () => {
      mockModels.unidade.findUnique.resolves(null);

      const res = await request(app).get('/api/v1/unidades/999');

      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/v1/unidades', () => {
    it('deve criar unidade com dados válidos', async () => {
      mockModels.unidade.create.resolves({
        id: 1, nome: 'Unidade Boa Viagem', endereco: 'Rua das Flores, 123', cidade: 'Recife', estado: 'PE'
      });

      const res = await request(app)
        .post('/api/v1/unidades')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Unidade Boa Viagem', endereco: 'Rua das Flores, 123', cidade: 'Recife', estado: 'PE' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('nome', 'Unidade Boa Viagem');
    });

    it('deve retornar 500 quando serviço falha', async () => {
      mockModels.unidade.create.rejects(new Error('DB error'));

      const res = await request(app)
        .post('/api/v1/unidades')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Unidade Boa Viagem', endereco: 'Rua das Flores, 123', cidade: 'Recife', estado: 'PE' });

      expect(res.status).to.equal(500);
    });

    it('deve retornar 422 com dados inválidos', async () => {
      const res = await request(app)
        .post('/api/v1/unidades')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'U' });

      expect(res.status).to.equal(422);
    });

    it('deve retornar 403 para CLIENTE', async () => {
      const res = await request(app)
        .post('/api/v1/unidades')
        .set('Authorization', `Bearer ${gerarToken('CLIENTE')}`)
        .send({ nome: 'Unidade X', endereco: 'Rua Y, 100', cidade: 'Recife', estado: 'PE' });

      expect(res.status).to.equal(403);
    });
  });

  describe('PUT /api/v1/unidades/:id', () => {
    it('deve atualizar unidade existente', async () => {
      mockModels.unidade.findUnique.resolves({ id: 1, nome: 'Unidade Centro', cidade: 'Recife' });
      mockModels.unidade.update.resolves({ id: 1, nome: 'Unidade Centro Novo', cidade: 'Recife' });

      const res = await request(app)
        .put('/api/v1/unidades/1')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Unidade Centro Novo' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('nome', 'Unidade Centro Novo');
    });

    it('deve retornar 404 quando unidade não existe', async () => {
      mockModels.unidade.findUnique.resolves(null);

      const res = await request(app)
        .put('/api/v1/unidades/999')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Novo Nome' });

      expect(res.status).to.equal(404);
    });
  });
});
