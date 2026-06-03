import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { unidadeRoutes } from './unidadeRoutes';
import { produtoRoutes } from './produtoRoutes';
import { estoqueRoutes } from './estoqueRoutes';
import { pedidoRoutes } from './pedidoRoutes';
import { pagamentoRoutes } from './pagamentoRoutes';
import { fidelidadeRoutes } from './fidelidadeRoutes';
import { promocaoRoutes } from './promocaoRoutes';
import { usuarioRoutes } from './usuarioRoutes';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/auth', authRoutes);
router.use('/unidades', unidadeRoutes);
router.use('/produtos', produtoRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/fidelidade', fidelidadeRoutes);
router.use('/promocoes', promocaoRoutes);

export { router };
