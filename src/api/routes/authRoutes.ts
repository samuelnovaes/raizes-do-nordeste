import { Router } from 'express';
import { z } from 'zod';
import { validacao } from '../middlewares/validacao.ts';
import { autenticacao } from '../middlewares/autenticacao.ts';
import * as authController from '../controllers/authController.ts';

const router = Router();

const esquemaRegistro = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  perfil: z.string().optional(),
  consentimentoLgpd: z.boolean().refine(val => val === true, {
    message: 'O consentimento LGPD é obrigatório para o cadastro'
  })
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
router.get('/perfil', autenticacao, authController.perfil);

export { router as authRoutes };
