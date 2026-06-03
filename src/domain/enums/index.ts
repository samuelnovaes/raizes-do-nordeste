// Enums do domínio

export enum Perfil {
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  ATENDENTE = 'ATENDENTE',
  COZINHA = 'COZINHA',
  CLIENTE = 'CLIENTE'
}

export enum CanalPedido {
  APP = 'APP',
  TOTEM = 'TOTEM',
  BALCAO = 'BALCAO',
  PICKUP = 'PICKUP',
  WEB = 'WEB'
}

export enum StatusPedido {
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  PAGO = 'PAGO',
  EM_PREPARO = 'EM_PREPARO',
  PRONTO = 'PRONTO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO'
}

export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  RECUSADO = 'RECUSADO',
  ESTORNADO = 'ESTORNADO'
}

export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  AJUSTE = 'AJUSTE'
}
