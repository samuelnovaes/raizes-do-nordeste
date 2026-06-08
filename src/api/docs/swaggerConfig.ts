// @ts-ignore
import swaggerJsdoc from 'swagger-jsdoc';

const opcoes = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Raízes do Nordeste',
      version: '1.0.0',
      description: 'API REST para a rede de lanchonetes Raízes do Nordeste. Gerencia pedidos, cardápio, estoque, pagamentos e programa de fidelidade com suporte a múltiplos canais (APP, TOTEM, BALCÃO, PICKUP, WEB).'
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Servidor local' },
      { url: 'https://raizes-do-nordeste.onrender.com/api/v1', description: 'Produção' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ErroPadrao: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'NOME_DO_ERRO' },
            message: { type: 'string', example: 'Mensagem legível' },
            details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, issue: { type: 'string' } } } },
            timestamp: { type: 'string', format: 'date-time' },
            path: { type: 'string' },
            requestId: { type: 'string', format: 'uuid' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            email: { type: 'string' },
            perfil: { type: 'string', enum: ['ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE'] },
            consentimentoLgpd: { type: 'boolean' },
            criadoEm: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', example: 'cliente@raizes.com' },
            senha: { type: 'string', example: 'Senha@123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string' },
            user: { $ref: '#/components/schemas/Usuario' }
          }
        },
        RegistroRequest: {
          type: 'object',
          required: ['nome', 'email', 'senha', 'consentimentoLgpd'],
          properties: {
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
            senha: { type: 'string', example: 'Senha@123' },
            cpf: { type: 'string', example: '12345678901' },
            telefone: { type: 'string', example: '81999999999' },
            consentimentoLgpd: { type: 'boolean', example: true }
          }
        },
        Unidade: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            endereco: { type: 'string' },
            cidade: { type: 'string' },
            estado: { type: 'string' },
            ativa: { type: 'boolean' }
          }
        },
        Produto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            preco: { type: 'number' },
            categoriaId: { type: 'integer' },
            ativo: { type: 'boolean' }
          }
        },
        CriarPedidoRequest: {
          type: 'object',
          required: ['unidadeId', 'canalPedido', 'itens', 'formaPagamento'],
          properties: {
            unidadeId: { type: 'integer', example: 1 },
            canalPedido: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'], example: 'TOTEM' },
            itens: {
              type: 'array',
              items: {
                type: 'object',
                required: ['produtoId', 'quantidade'],
                properties: {
                  produtoId: { type: 'integer', example: 1 },
                  quantidade: { type: 'integer', example: 2 }
                }
              }
            },
            formaPagamento: { type: 'string', example: 'PIX' }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            usuarioId: { type: 'integer' },
            unidadeId: { type: 'integer' },
            canalPedido: { type: 'string', enum: ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'] },
            status: { type: 'string', enum: ['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'] },
            total: { type: 'number' },
            formaPagamento: { type: 'string' },
            itens: { type: 'array', items: { type: 'object' } },
            criadoEm: { type: 'string', format: 'date-time' }
          }
        },
        ProcessarPagamentoRequest: {
          type: 'object',
          required: ['pedidoId', 'metodo'],
          properties: {
            pedidoId: { type: 'integer', example: 1 },
            metodo: { type: 'string', example: 'PIX' }
          }
        },
        Pagamento: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            pedidoId: { type: 'integer' },
            status: { type: 'string', enum: ['PENDENTE', 'APROVADO', 'RECUSADO'] },
            valor: { type: 'number' },
            metodo: { type: 'string' },
            transacaoId: { type: 'string' }
          }
        },
        Fidelidade: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            usuarioId: { type: 'integer' },
            pontos: { type: 'integer' },
            consentimento: { type: 'boolean' }
          }
        }
      }
    }
  },
  apis: ['./src/api/docs/*.ts']
};

export const swaggerSpec = swaggerJsdoc(opcoes);
