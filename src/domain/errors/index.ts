import { AppError } from './AppError.ts';

export { AppError };

export const erroValidacao = (detalhes: string[] = []) => {
  return new AppError(422, 'ERRO_VALIDACAO', 'Erro de validação', detalhes);
};

export const erroNaoEncontrado = (recurso: string) => {
  return new AppError(404, 'NAO_ENCONTRADO', `${recurso} não encontrado(a)`);
};

export const erroNaoAutenticado = () => {
  return new AppError(401, 'NAO_AUTENTICADO', 'Usuário não autenticado');
};

export const erroSemPermissao = () => {
  return new AppError(403, 'SEM_PERMISSAO', 'Sem permissão para esta ação');
};

export const erroConflito = (mensagem: string) => {
  return new AppError(409, 'CONFLITO', mensagem);
};
