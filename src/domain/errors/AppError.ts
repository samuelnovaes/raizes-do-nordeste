export class AppError extends Error {
  public readonly statusCode: number;
  public readonly codigo: string;
  public readonly detalhes: string[];

  constructor(statusCode: number, codigo: string, mensagem: string, detalhes: string[] = []) {
    super(mensagem);
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.detalhes = detalhes;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
