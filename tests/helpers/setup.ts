import sinon from 'sinon';
import * as models from '../../src/infrastructure/database/models';

// Stub de todos os métodos dos modelos Mongoose para testes
const mockModels: any = {};

// Helper para criar um stub de find que suporta chaining (.populate, .skip, .limit)
function createChainableFind(stub: sinon.SinonStub) {
  const chainable = {
    populate: sinon.stub().returnsThis(),
    skip: sinon.stub().returnsThis(),
    limit: sinon.stub().returnsThis(),
    sort: sinon.stub().returnsThis(),
    then: (resolve: any, reject: any) => {
      return (stub as any)._lastResult !== undefined
        ? Promise.resolve((stub as any)._lastResult).then(resolve, reject)
        : Promise.resolve([]).then(resolve, reject);
    }
  };

  // Override resolves to also set the chain result
  const originalResolves = stub.resolves.bind(stub);
  stub.resolves = (val?: any) => {
    (stub as any)._lastResult = val;
    chainable.populate.returns(chainable);
    chainable.skip.returns(chainable);
    chainable.limit.returns(chainable);
    chainable.sort.returns(chainable);
    chainable.then = (resolve: any, reject: any) => Promise.resolve(val).then(resolve, reject);
    stub.returns(chainable);
    return stub;
  };

  const originalRejects = stub.rejects.bind(stub);
  stub.rejects = (val?: any) => {
    chainable.populate.returns(chainable);
    chainable.skip.returns(chainable);
    chainable.limit.returns(chainable);
    chainable.sort.returns(chainable);
    chainable.then = (_resolve: any, reject: any) => {
      const err = val instanceof Error ? val : new Error(val);
      return Promise.reject(err).then(undefined, reject);
    };
    stub.returns(chainable);
    return stub;
  };

  // Default: returns empty chainable
  stub.returns(chainable);

  return stub;
}

// Helper para criar stub de findById/findOne que suporta .populate()
function createPopulatableStub(stub: sinon.SinonStub) {
  const originalResolves = stub.resolves.bind(stub);
  stub.resolves = (val?: any) => {
    const result = {
      populate: sinon.stub().resolves(val),
      select: sinon.stub().resolves(val),
      then: (resolve: any, reject: any) => Promise.resolve(val).then(resolve, reject)
    };
    stub.returns(result);
    return stub;
  };

  const originalRejects = stub.rejects.bind(stub);
  stub.rejects = (val?: any) => {
    const err = val instanceof Error ? val : new Error(val);
    const result = {
      populate: sinon.stub().rejects(err),
      select: sinon.stub().rejects(err),
      then: (_resolve: any, reject: any) => Promise.reject(err).then(undefined, reject)
    };
    stub.returns(result);
    return stub;
  };

  return stub;
}

function stubModel(model: any, name: string) {
  const findStub = sinon.stub(model, 'find');
  createChainableFind(findStub);

  const findByIdStub = sinon.stub(model, 'findById');
  createPopulatableStub(findByIdStub);
  const findOneStub = sinon.stub(model, 'findOne');

  const stubs: any = {
    findOne: findOneStub,
    findById: findByIdStub,
    find: findStub,
    create: sinon.stub(model, 'create'),
    findByIdAndUpdate: sinon.stub(model, 'findByIdAndUpdate'),
    findOneAndUpdate: sinon.stub(model, 'findOneAndUpdate'),
    countDocuments: sinon.stub(model, 'countDocuments'),
    deleteOne: sinon.stub(model, 'deleteOne')
  };
  // Aliases para compatibilidade com testes existentes (Prisma -> Mongoose)
  stubs.findUnique = stubs.findById;
  stubs.findFirst = stubs.findOne;
  stubs.update = stubs.findByIdAndUpdate;
  stubs.upsert = stubs.findOneAndUpdate;
  mockModels[name] = stubs;
}

stubModel(models.Usuario, 'usuario');
stubModel(models.Pedido, 'pedido');
stubModel(models.Produto, 'produto');
stubModel(models.Estoque, 'estoque');
stubModel(models.Pagamento, 'pagamento');
stubModel(models.MovimentacaoEstoque, 'movimentacaoEstoque');
stubModel(models.LogAuditoria, 'logAuditoria');
stubModel(models.Fidelidade, 'fidelidade');
stubModel(models.Unidade, 'unidade');
stubModel(models.Categoria, 'categoria');
stubModel(models.Promocao, 'promocao');

process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'mongodb://mock:mock@localhost:27017/mock';
process.env.NODE_ENV = 'test';

export { mockModels };
