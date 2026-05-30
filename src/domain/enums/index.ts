// Enums do domínio

export enum Perfil {
  ADMIN = 'ADMIN',
  PRODUTOR = 'PRODUTOR',
  CLIENTE = 'CLIENTE'
}

export enum CanalPedido {
  WHATSAPP = 'WHATSAPP',
  SITE = 'SITE',
  APP = 'APP'
}

export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_PREPARO = 'EM_PREPARO',
  ENVIADO = 'ENVIADO',
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
