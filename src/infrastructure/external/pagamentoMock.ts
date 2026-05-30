import { randomUUID } from 'crypto';

interface RespostaPagamento {
  sucesso: boolean;
  transacaoId: string;
  mensagem: string;
}

// Serviço mock de processamento de pagamento
export function processarPagamentoMock(valor: number, metodo: string): RespostaPagamento {
  if (metodo === 'RECUSADO' || valor > 10000) {
    return {
      sucesso: false,
      transacaoId: '',
      mensagem: 'Pagamento recusado'
    };
  }

  return {
    sucesso: true,
    transacaoId: randomUUID(),
    mensagem: 'Pagamento aprovado com sucesso'
  };
}
