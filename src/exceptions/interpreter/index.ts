export class InterpreterException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LexerException";
  }
}
