export class InvalidVariableTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidVariableTypeError"; // Set the error name
    Object.setPrototypeOf(this, InvalidVariableTypeError.prototype); // Fix prototype chain
  }
}
