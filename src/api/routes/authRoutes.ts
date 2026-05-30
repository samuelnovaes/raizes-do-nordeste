import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao.ts';
import * as authController from '../controllers/authController.ts';

const router = Router();

const esquemaRegistro = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  perfil: z.string().optional()
});

const esquemaLogin = z.object({
  email: z.string().email(),
  senha: z.string().min(1)
});

const esquemaRefresh = z.object({
  token: z.string().min(1)
});

router.post('/registrar', validacao(esquemaRegistro), authController.registrar);
router.post('/login', validacao(esquemaLogin), authController.login);
router.post('/refresh', validacao(esquemaRefresh), authController.renovarToken);

export { router as authRoutes };
