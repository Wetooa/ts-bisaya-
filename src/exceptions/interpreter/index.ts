export class InterpreterException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InterpreterException"; // Set the error name
    Object.setPrototypeOf(this, InterpreterException.prototype); // Fix prototype chain
  }
}

export class InvalidVariableTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVariableTypeError"; // Set the error name
    Object.setPrototypeOf(this, InvalidVariableTypeError.prototype); // Fix prototype chain
  }
}
