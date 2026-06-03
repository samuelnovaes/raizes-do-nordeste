import { expect } from 'chai';
import request from 'supertest';
import { mockModels } from '../helpers/setup';
import { app } from '../../src/app';

describe('App - Integração', () => {
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

  describe('GET /saude', () => {
    it('deve retornar status ok', async () => {
      const res = await request(app).get('/saude');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'ok');
      expect(res.body).to.have.property('timestamp');
    });
  });

  describe('GET /docs/swagger.json', () => {
    it('deve retornar especificação swagger em JSON', async () => {
      const res = await request(app).get('/docs/swagger.json');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('openapi');
    });
  });
});
