import { expect } from 'chai';
import { processarPagamentoMock } from '../../src/infrastructure/external/pagamentoMock.ts';

describe('processarPagamentoMock', () => {
  it('deve aprovar pagamento com valor válido', () => {
    const resultado = processarPagamentoMock(100, 'PIX');
    expect(resultado.sucesso).to.be.true;
    expect(resultado.mensagem).to.equal('Pagamento aprovado com sucesso');
  });

  it('deve recusar pagamento quando método é RECUSADO', () => {
    const resultado = processarPagamentoMock(100, 'RECUSADO');
    expect(resultado.sucesso).to.be.false;
    expect(resultado.mensagem).to.equal('Pagamento recusado');
  });

  it('deve recusar pagamento quando valor excede 10000', () => {
    const resultado = processarPagamentoMock(10001, 'PIX');
    expect(resultado.sucesso).to.be.false;
    expect(resultado.mensagem).to.equal('Pagamento recusado');
  });

  it('deve retornar transacaoId no formato UUID quando aprovado', () => {
    const resultado = processarPagamentoMock(50, 'PIX');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(resultado.transacaoId).to.match(uuidRegex);
  });
});
