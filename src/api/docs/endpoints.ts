/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     tags: [Autenticação]
 *     summary: Registrar novo usuário
 *     description: Cadastra um novo usuário no sistema. Requer consentimento LGPD.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       409:
 *         description: E-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroPadrao'
 *       422:
 *         description: Dados inválidos
 *
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Realizar login
 *     description: Autentica o usuário e retorna um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *
 * /unidades:
 *   get:
 *     tags: [Unidades]
 *     summary: Listar unidades da rede
 *     description: Retorna todas as unidades ativas da rede.
 *     responses:
 *       200:
 *         description: Lista de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Unidade'
 *   post:
 *     tags: [Unidades]
 *     summary: Criar nova unidade
 *     security:
 *       - bearerAuth: []
 *     description: Cria uma nova unidade. Requer perfil ADMIN ou GERENTE.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, endereco, cidade, estado]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Raízes Aldeota"
 *               endereco:
 *                 type: string
 *                 example: "Rua Torres Câmara, 200"
 *               cidade:
 *                 type: string
 *                 example: "Fortaleza"
 *               estado:
 *                 type: string
 *                 example: "CE"
 *     responses:
 *       201:
 *         description: Unidade criada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *
 * /unidades/{id}:
 *   get:
 *     tags: [Unidades]
 *     summary: Buscar unidade por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da unidade
 *       404:
 *         description: Unidade não encontrada
 *
 * /produtos:
 *   get:
 *     tags: [Produtos]
 *     summary: Listar produtos
 *     description: Lista todos os produtos com paginação.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de produtos
 *   post:
 *     tags: [Produtos]
 *     summary: Criar produto
 *     security:
 *       - bearerAuth: []
 *     description: Cria um novo produto. Requer perfil ADMIN ou GERENTE.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, preco, categoriaId]
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoriaId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *
 * /produtos/cardapio/{unidadeId}:
 *   get:
 *     tags: [Produtos]
 *     summary: Consultar cardápio por unidade
 *     description: Retorna produtos disponíveis (com estoque) em uma unidade específica.
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cardápio da unidade
 *       404:
 *         description: Unidade não encontrada
 *
 * /estoque/{unidadeId}:
 *   get:
 *     tags: [Estoque]
 *     summary: Consultar estoque de uma unidade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: produtoId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens em estoque
 *       401:
 *         description: Não autenticado
 *
 * /estoque/movimentacao:
 *   post:
 *     tags: [Estoque]
 *     summary: Registrar movimentação de estoque
 *     security:
 *       - bearerAuth: []
 *     description: Registra entrada ou saída de estoque. Requer perfil GERENTE ou ATENDENTE.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [produtoId, unidadeId, tipo, quantidade]
 *             properties:
 *               produtoId:
 *                 type: integer
 *               unidadeId:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [ENTRADA, SAIDA]
 *               quantidade:
 *                 type: integer
 *                 minimum: 1
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movimentação registrada
 *       409:
 *         description: Estoque insuficiente (para saída)
 *
 * /pedidos:
 *   post:
 *     tags: [Pedidos]
 *     summary: Criar pedido
 *     security:
 *       - bearerAuth: []
 *     description: Cria um novo pedido validando estoque e calculando total. Campo canalPedido é obrigatório.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarPedidoRequest'
 *     responses:
 *       201:
 *         description: Pedido criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: Unidade ou produto não encontrado
 *       409:
 *         description: Estoque insuficiente
 *       422:
 *         description: Dados inválidos (canalPedido ausente/inválido)
 *   get:
 *     tags: [Pedidos]
 *     summary: Listar pedidos
 *     security:
 *       - bearerAuth: []
 *     description: Lista pedidos com filtros opcionais por canal, status e unidade.
 *     parameters:
 *       - in: query
 *         name: canalPedido
 *         schema:
 *           type: string
 *           enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AGUARDANDO_PAGAMENTO, PAGO, EM_PREPARO, PRONTO, ENTREGUE, CANCELADO]
 *       - in: query
 *         name: unidadeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de pedidos
 *       401:
 *         description: Não autenticado
 *
 * /pedidos/{id}:
 *   get:
 *     tags: [Pedidos]
 *     summary: Buscar pedido por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do pedido
 *       404:
 *         description: Pedido não encontrado
 *
 * /pedidos/{id}/status:
 *   patch:
 *     tags: [Pedidos]
 *     summary: Atualizar status do pedido
 *     security:
 *       - bearerAuth: []
 *     description: Atualiza o status do pedido. Requer perfil ATENDENTE, COZINHA ou GERENTE.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PAGO, EM_PREPARO, PRONTO, ENTREGUE, CANCELADO]
 *     responses:
 *       200:
 *         description: Status atualizado
 *       409:
 *         description: Transição de status inválida
 *
 * /pagamentos:
 *   post:
 *     tags: [Pagamentos]
 *     summary: Processar pagamento (mock)
 *     security:
 *       - bearerAuth: []
 *     description: Simula o processamento de pagamento via serviço externo. Retorna aprovado ou recusado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessarPagamentoRequest'
 *     responses:
 *       200:
 *         description: Pagamento processado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pagamento'
 *       404:
 *         description: Pedido não encontrado
 *       409:
 *         description: Pagamento já processado ou pedido não aguarda pagamento
 *
 * /fidelidade/pontos:
 *   get:
 *     tags: [Fidelidade]
 *     summary: Consultar pontos do programa de fidelidade
 *     security:
 *       - bearerAuth: []
 *     description: Retorna o saldo de pontos e histórico do cliente autenticado.
 *     responses:
 *       200:
 *         description: Dados de fidelidade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fidelidade'
 *       401:
 *         description: Não autenticado
 *
 * /fidelidade/resgate:
 *   post:
 *     tags: [Fidelidade]
 *     summary: Resgatar pontos de fidelidade
 *     security:
 *       - bearerAuth: []
 *     description: Permite ao cliente resgatar pontos acumulados. Requer consentimento ativo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pontos, descricao]
 *             properties:
 *               pontos:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *               descricao:
 *                 type: string
 *                 example: "Desconto em pedido"
 *     responses:
 *       200:
 *         description: Resgate realizado
 *       409:
 *         description: Pontos insuficientes ou sem consentimento
 *
 * /auth/perfil:
 *   get:
 *     tags: [Usuários]
 *     summary: Consultar perfil do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     description: Retorna os dados do perfil do usuário logado (sem expor senha ou dados sensíveis). Rota disponível em GET /auth/perfil.
 *     responses:
 *       200:
 *         description: Dados do perfil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 *
 * /promocoes:
 *   get:
 *     tags: [Promoções]
 *     summary: Listar promoções/campanhas ativas
 *     description: Retorna promoções vigentes. Filtrável por unidadeId, canalPedido e produtoId.
 *     parameters:
 *       - in: query
 *         name: unidadeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: canalPedido
 *         schema:
 *           type: string
 *           enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
 *       - in: query
 *         name: produtoId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de promoções ativas
 *   post:
 *     tags: [Promoções]
 *     summary: Criar promoção/campanha
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Cria uma nova promoção. Requer perfil ADMIN ou GERENTE.
 *       Tipos de promoção: PERCENTUAL (desconto %), VALOR_FIXO (desconto em R$), LEVE_PAGUE (leve X pague Y).
 *       Regras: apenas 1 promoção por pedido (maior benefício), promoções podem ser limitadas por unidade, canal ou produto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, descricao, tipo, valor, dataInicio, dataFim]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Promoção de Inauguração"
 *               descricao:
 *                 type: string
 *                 example: "20% de desconto em todos os lanches"
 *               tipo:
 *                 type: string
 *                 enum: [PERCENTUAL, VALOR_FIXO, LEVE_PAGUE]
 *               valor:
 *                 type: number
 *                 example: 20
 *               dataInicio:
 *                 type: string
 *                 format: date-time
 *               dataFim:
 *                 type: string
 *                 format: date-time
 *               unidadeId:
 *                 type: string
 *               produtoId:
 *                 type: string
 *               canalPedido:
 *                 type: string
 *                 enum: [APP, TOTEM, BALCAO, PICKUP, WEB]
 *               ativo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Promoção criada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
