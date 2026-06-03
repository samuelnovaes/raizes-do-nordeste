import { expect } from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { conectarMongoDB, desconectarMongoDB } from '../../src/infrastructure/database/mongoose';

describe('mongoose - conexão', () => {
  let connectStub: sinon.SinonStub;
  let disconnectStub: sinon.SinonStub;
  let consoleStub: sinon.SinonStub;
  let originalReadyState: number;

  beforeEach(() => {
    connectStub = sinon.stub(mongoose, 'connect').resolves(mongoose);
    disconnectStub = sinon.stub(mongoose, 'disconnect').resolves();
    consoleStub = sinon.stub(console, 'log');
    originalReadyState = mongoose.connection.readyState;
  });

  afterEach(() => {
    connectStub.restore();
    disconnectStub.restore();
    consoleStub.restore();
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
  });

  it('deve exportar conectarMongoDB como função', () => {
    expect(conectarMongoDB).to.be.a('function');
  });

  it('deve exportar desconectarMongoDB como função', () => {
    expect(desconectarMongoDB).to.be.a('function');
  });

  describe('conectarMongoDB', () => {
    it('deve conectar usando DATABASE_URL do ambiente', async () => {
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

      await conectarMongoDB();

      expect(connectStub.calledOnce).to.be.true;
      expect(connectStub.firstCall.args[0]).to.equal(process.env.DATABASE_URL);
      expect(consoleStub.calledWith('Conectado ao MongoDB')).to.be.true;
    });

    it('deve usar URI padrão quando DATABASE_URL não está definida', async () => {
      const original = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

      await conectarMongoDB();

      expect(connectStub.firstCall.args[0]).to.equal('mongodb://localhost:27017/raizes_nordeste');

      process.env.DATABASE_URL = original;
    });

    it('deve não reconectar quando já está conectado (readyState === 1)', async () => {
      Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

      await conectarMongoDB();

      expect(connectStub.called).to.be.false;
    });

    it('deve propagar erro quando conexão falha', async () => {
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });
      connectStub.rejects(new Error('Connection refused'));

      try {
        await conectarMongoDB();
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.message).to.equal('Connection refused');
      }
    });
  });

  describe('desconectarMongoDB', () => {
    it('deve chamar mongoose.disconnect', async () => {
      await desconectarMongoDB();

      expect(disconnectStub.calledOnce).to.be.true;
    });

    it('deve propagar erro quando desconexão falha', async () => {
      disconnectStub.rejects(new Error('Disconnect failed'));

      try {
        await desconectarMongoDB();
        expect.fail('Deveria ter lançado erro');
      } catch (erro: any) {
        expect(erro.message).to.equal('Disconnect failed');
      }
    });
  });
});
