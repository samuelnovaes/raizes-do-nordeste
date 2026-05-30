import { Router } from 'express';
import { authRoutes } from './authRoutes.ts';
import { unidadeRoutes } from './unidadeRoutes.ts';
import { produtoRoutes } from './produtoRoutes.ts';
import { estoqueRoutes } from './estoqueRoutes.ts';
import { pedidoRoutes } from './pedidoRoutes.ts';
import { pagamentoRoutes } from './pagamentoRoutes.ts';
import { fidelidadeRoutes } from './fidelidadeRoutes.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/unidades', unidadeRoutes);
router.use('/produtos', produtoRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/fidelidade', fidelidadeRoutes);

export { router };
