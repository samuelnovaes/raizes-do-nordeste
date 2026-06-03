import { Router } from 'express';
import { autenticacao, autorizarPerfis } from '../middlewares/autenticacao.ts';
import * as usuarioController from '../controllers/usuarioController.ts';

const router = Router();

router.get('/', autenticacao, autorizarPerfis('ADMIN'), usuarioController.listar);
router.get('/:id', autenticacao, autorizarPerfis('ADMIN'), usuarioController.buscarPorId);

export { router as usuarioRoutes };
