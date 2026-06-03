import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { erroHandler } from '../../src/api/middlewares/erroHandler';
import { autenticacao, autorizarPerfis } from '../../src/api/middlewares/autenticacao';
import { validacao } from '../../src/api/middlewares/validacao';
import { AppError } from '../../src/domain/errors/AppError';

describe('erroHandler Middleware', () => {
  it('deve tratar AppError corretamente', () => {
    const erro = new AppError(422, 'ERRO_VALIDACAO', 'Campo inválido', ['nome é obrigatório']);
    const req = { originalUrl: '/api/v1/test' } as Request;
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    } as any;
    const next = sinon.stub() as unknown as NextFunction;

    erroHandler(erro, req, res, next);

    expect(res.status.calledWith(422)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal('ERRO_VALIDACAO');
    expect(body.details).to.deep.equal(['nome é obrigatório']);
  });

  it('deve tratar erro genérico como 500', () => {
    const erro = new Error('Erro inesperado');
    const req = { originalUrl: '/api/v1/test' } as Request;
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    } as any;
    const next = sinon.stub() as unknown as NextFunction;

    // Suppress console.error
    const consoleStub = sinon.stub(console, 'error');

    erroHandler(erro, req, res, next);

    expect(res.status.calledWith(500)).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body.error).to.equal('ERRO_INTERNO');

    consoleStub.restore();
  });
});

describe('validacao Middleware', () => {
  it('deve chamar next(erro) quando parse lança erro não-Zod', () => {
    const esquemaFalso = {
      parse: () => { throw new Error('Erro inesperado'); }
    };
    const middleware = validacao(esquemaFalso as any);
    const req = { body: {} } as Request;
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() } as any;
    const next = sinon.stub() as any;

    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.be.instanceOf(Error);
    expect(next.firstCall.args[0].message).to.equal('Erro inesperado');
  });
});

describe('autenticacao Middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('deve lançar erro sem header authorization', () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    expect(() => autenticacao(req, res, next)).to.throw();
  });

  it('deve lançar erro com header sem Bearer', () => {
    const req = { headers: { authorization: 'Basic token' } } as Request;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    expect(() => autenticacao(req, res, next)).to.throw();
  });

  it('deve lançar erro com token inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } } as Request;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    expect(() => autenticacao(req, res, next)).to.throw();
  });

  it('deve usar segredo padrão quando JWT_SECRET não está definido', () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    const token = jwt.sign({ id: '1', email: 'a@b.c', perfil: 'CLIENTE' }, 'segredo-padrao', { expiresIn: '1h' });

    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    autenticacao(req, res, next);

    expect((next as sinon.SinonStub).calledOnce).to.be.true;
    expect((req as any).usuario).to.have.property('email', 'a@b.c');

    process.env.JWT_SECRET = original;
  });
});

describe('autorizarPerfis Middleware', () => {
  it('deve lançar erro quando não há usuário no request', () => {
    const middleware = autorizarPerfis('GERENTE');
    const req = {} as Request;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    expect(() => middleware(req, res, next)).to.throw();
  });

  it('deve lançar erro quando perfil não é permitido', () => {
    const middleware = autorizarPerfis('GERENTE', 'ADMIN');
    const req = { usuario: { id: '1', email: 'a@b.c', perfil: 'CLIENTE' } } as any;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    expect(() => middleware(req, res, next)).to.throw();
  });

  it('deve chamar next quando perfil é permitido', () => {
    const middleware = autorizarPerfis('GERENTE', 'ADMIN');
    const req = { usuario: { id: '1', email: 'a@b.c', perfil: 'GERENTE' } } as any;
    const res = {} as Response;
    const next = sinon.stub() as unknown as NextFunction;

    middleware(req, res, next);

    expect((next as sinon.SinonStub).calledOnce).to.be.true;
  });
});
