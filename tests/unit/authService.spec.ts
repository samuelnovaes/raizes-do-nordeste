import { expect } from 'chai';
import sinon from 'sinon';
import { mockModels } from '../helpers/setup';
import bcrypt from 'bcryptjs';

import * as authService from '../../src/application/services/authService';

describe('AuthService - Unit', () => {
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

  describe('loginUsuario', () => {
    it('deve lançar erro quando JWT_SECRET não está configurado', async () => {
      const senhaHash = await bcrypt.hash('123456', 10);
      mockModels.usuario.findOne.resolves({
        _id: '1', email: 'test@email.com', senha: senhaHash, perfil: 'CLIENTE'
      });

      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      try {
        await authService.loginUsuario('test@email.com', '123456');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.message).to.equal('JWT_SECRET não configurado');
      } finally {
        process.env.JWT_SECRET = original;
      }
    });
  });

  describe('refreshToken', () => {
    it('deve lançar erro quando JWT_SECRET não está configurado', async () => {
      const original = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      try {
        await authService.refreshToken('some-token');
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.message).to.equal('JWT_SECRET não configurado');
      } finally {
        process.env.JWT_SECRET = original;
      }
    });
  });
});
