import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao';

const router = Router();

const esquemaCriar = z.object({
  nome: z.string().min(2),
  descricao: z.string().min(1),
  tipo: z.enum(['PERCENTUAL', 'VALOR_FIXO', 'LEVE_PAGUE']),
  valor: z.number().positive(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
  unidadeId: z.string().optional(),
  produtoId: z.string().optional(),
  canalPedido: z.enum(['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB']).optional(),
  ativo: z.boolean().optional()
});

// Listar promoções ativas
router.get('/', async (req, res) => {
  // Retorna promoções vigentes (data atual entre dataInicio e dataFim)
  // Filtrável por unidadeId, canalPedido e produtoId
  res.json({
    dados: [],
    mensagem: 'Endpoint de promoções/campanhas - funcionalidade planejada para expansão futura'
  });
});

// Criar promoção/campanha (GERENTE/ADMIN)
router.post('/', autenticacao, autorizarPerfis('GERENTE', 'ADMIN'), validacao(esquemaCriar), async (req, res) => {
  // Regras de aplicação de promoções:
  // 1. Promoção PERCENTUAL: aplica desconto % sobre o total do pedido ou item específico
  // 2. Promoção VALOR_FIXO: desconto de valor fixo no total
  // 3. Promoção LEVE_PAGUE: ex. leve 3, pague 2 (campo valor indica quantidade paga)
  //
  // Regras de negócio:
  // - Promoções podem ser limitadas a uma unidade específica (unidadeId)
  // - Promoções podem ser limitadas a um canal específico (canalPedido)
  // - Promoções podem ser limitadas a um produto específico (produtoId)
  // - Apenas uma promoção pode ser aplicada por pedido (a de maior benefício)
  // - Promoções expiradas (dataFim < now) não são aplicáveis
  // - O campo "ativo" permite desativar manualmente uma promoção antes da data fim
  res.status(201).json({
    mensagem: 'Promoção criada (funcionalidade conceitual - implementação planejada)'
  });
});

export { router as promocaoRoutes };
