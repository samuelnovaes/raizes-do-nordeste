# Raízes do Nordeste - API REST

API REST para a rede de lanchonetes **Raízes do Nordeste**, desenvolvida com Node.js, Express, TypeScript e MongoDB. Suporta múltiplos canais de atendimento (APP, TOTEM, BALCÃO, PICKUP, WEB).

## Tecnologias

- **Runtime:** Node.js 24 LTS
- **Framework:** Express 5
- **Linguagem:** TypeScript
- **Banco de dados:** MongoDB 7
- **ODM:** Mongoose 8
- **Autenticação:** JWT (jsonwebtoken + bcryptjs)
- **Validação:** Zod
- **Documentação:** Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express)
- **Testes:** Mocha + Chai + Sinon + Supertest
- **Containerização:** Docker + Docker Compose

## Requisitos

- Node.js >= 24 (LTS)
- Docker e Docker Compose
- npm >= 11

## Instalação e Execução

### Com Docker (recomendado)

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd raizes-do-nordeste

# Subir banco e API
docker-compose up --build
```

A API estará disponível em `http://localhost:3000`.

### Sem Docker (desenvolvimento local)

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações de banco

# Popular banco com dados de teste
npm run seed

# Iniciar em modo desenvolvimento
npm run dev
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| DATABASE_URL | URL de conexão MongoDB | mongodb://localhost:27017/raizes_nordeste |
| JWT_SECRET | Chave secreta para tokens JWT | sua-chave-secreta-aqui |
| JWT_EXPIRES_IN | Tempo de expiração do token | 1h |
| PORT | Porta da API | 3000 |
| NODE_ENV | Ambiente de execução | development |

## Documentação da API (Swagger)

Acesse a documentação interativa em:

```
http://localhost:3000/docs
```

JSON da especificação OpenAPI:
```
http://localhost:3000/docs/swagger.json
```

## Endpoints Principais

| Módulo | Método | Rota | Descrição |
|--------|--------|------|-----------|
| Auth | POST | /api/v1/auth/registrar | Registrar usuário |
| Auth | POST | /api/v1/auth/login | Fazer login |
| Unidades | GET | /api/v1/unidades | Listar unidades |
| Unidades | POST | /api/v1/unidades | Criar unidade |
| Produtos | GET | /api/v1/produtos | Listar produtos |
| Produtos | GET | /api/v1/produtos/cardapio/:unidadeId | Cardápio por unidade |
| Produtos | POST | /api/v1/produtos | Criar produto |
| Estoque | GET | /api/v1/estoque/:unidadeId | Consultar estoque |
| Estoque | POST | /api/v1/estoque/movimentacao | Registrar movimentação |
| Pedidos | POST | /api/v1/pedidos | Criar pedido |
| Pedidos | GET | /api/v1/pedidos | Listar pedidos (filtros: canalPedido, status) |
| Pedidos | GET | /api/v1/pedidos/:id | Buscar pedido |
| Pedidos | PATCH | /api/v1/pedidos/:id/status | Atualizar status |
| Pagamentos | POST | /api/v1/pagamentos | Processar pagamento (mock) |
| Fidelidade | GET | /api/v1/fidelidade/pontos | Consultar pontos |
| Fidelidade | POST | /api/v1/fidelidade/resgate | Resgatar pontos |
| Promoções | GET | /api/v1/promocoes | Listar promoções ativas |
| Promoções | POST | /api/v1/promocoes | Criar promoção/campanha |

## Usuários de Teste (seed)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@raizes.com | Senha@123 | ADMIN |
| gerente@raizes.com | Senha@123 | GERENTE |
| atendente@raizes.com | Senha@123 | ATENDENTE |
| cozinha@raizes.com | Senha@123 | COZINHA |
| cliente@raizes.com | Senha@123 | CLIENTE |

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage
```

## Padrão de Erro

Todas as respostas de erro seguem o formato:

```json
{
  "error": "CODIGO_DO_ERRO",
  "message": "Mensagem legível para o usuário",
  "details": [
    { "field": "campo", "issue": "problema" }
  ],
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/rota",
  "requestId": "uuid-da-requisicao"
}
```

## Fluxo Crítico: Pedido → Pagamento → Status

1. **Criar pedido** (`POST /api/v1/pedidos`) — valida estoque, calcula total, registra canal
2. **Processar pagamento** (`POST /api/v1/pagamentos`) — mock simula aprovação/recusa
3. **Atualizar status** (`PATCH /api/v1/pedidos/:id/status`) — transições: AGUARDANDO_PAGAMENTO → PAGO → EM_PREPARO → PRONTO → ENTREGUE

## Multicanalidade

O campo `canalPedido` é obrigatório na criação de pedidos. Valores aceitos:
- `APP` - Aplicativo mobile
- `TOTEM` - Totem de autoatendimento
- `BALCAO` - Atendimento no balcão
- `PICKUP` - Retirada no local
- `WEB` - Pedido via website

Filtrar pedidos por canal: `GET /api/v1/pedidos?canalPedido=TOTEM`

## LGPD e Segurança

- Senhas armazenadas com hash (bcrypt, 10 rounds)
- Autenticação via JWT com expiração configurável
- Autorização por perfis (ADMIN, GERENTE, ATENDENTE, COZINHA, CLIENTE)
- Consentimento LGPD obrigatório no cadastro
- Programa de fidelidade requer consentimento explícito
- Dados sensíveis (senha, CPF) não são expostos nas respostas
- Logs de auditoria para ações sensíveis (criação de pedido, mudança de status, pagamentos)

## Estrutura do Projeto

```
src/
├── domain/           # Entidades, enums e erros do domínio
│   ├── enums/
│   └── errors/
├── application/      # Casos de uso / serviços
│   └── services/
├── infrastructure/   # Banco de dados, repositórios, integrações
│   ├── database/
│   │   ├── mongoose.ts       # Conexão MongoDB
│   │   └── models/           # Schemas Mongoose
│   ├── repositories/
│   └── external/
└── api/              # Controllers, middlewares, rotas, docs
    ├── controllers/
    ├── middlewares/
    ├── routes/
    └── docs/
```

## Collection Postman

O arquivo `postman_collection.json` na raiz do repositório contém todos os endpoints organizados por módulo, com testes automatizados e variáveis de ambiente.

Para importar: Postman → Import → selecione o arquivo `postman_collection.json`.

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript |
| `npm start` | Inicia a versão compilada |
| `npm test` | Executa testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Verifica estilo do código |
| `npm run seed` | Popula banco com dados de teste |
