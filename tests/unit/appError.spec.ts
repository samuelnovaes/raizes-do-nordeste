import { expect } from 'chai';
import {
  AppError,
  erroValidacao,
  erroNaoEncontrado,
  erroNaoAutenticado,
  erroSemPermissao,
  erroConflito
} from '../../src/domain/errors/index.ts';

describe('AppError', () => {
  it('deve criar erro com statusCode e código correto', () => {
    const erro = new AppError(500, 'ERRO_INTERNO', 'Erro interno');
    expect(erro.statusCode).to.equal(500);
    expect(erro.codigo).to.equal('ERRO_INTERNO');
    expect(erro.message).to.equal('Erro interno');
  });

  it('erroValidacao deve retornar status 422', () => {
    const erro = erroValidacao(['campo obrigatório']);
    expect(erro.statusCode).to.equal(422);
    expect(erro.codigo).to.equal('ERRO_VALIDACAO');
  });

  it('erroNaoEncontrado deve retornar status 404', () => {
    const erro = erroNaoEncontrado('Produto');
    expect(erro.statusCode).to.equal(404);
    expect(erro.codigo).to.equal('NAO_ENCONTRADO');
  });

  it('erroNaoAutenticado deve retornar status 401', () => {
    const erro = erroNaoAutenticado();
    expect(erro.statusCode).to.equal(401);
    expect(erro.codigo).to.equal('NAO_AUTENTICADO');
  });

  it('erroSemPermissao deve retornar status 403', () => {
    const erro = erroSemPermissao();
    expect(erro.statusCode).to.equal(403);
    expect(erro.codigo).to.equal('SEM_PERMISSAO');
  });

  it('erroConflito deve retornar status 409', () => {
    const erro = erroConflito('Recurso já existe');
    expect(erro.statusCode).to.equal(409);
    expect(erro.codigo).to.equal('CONFLITO');
  });
});
