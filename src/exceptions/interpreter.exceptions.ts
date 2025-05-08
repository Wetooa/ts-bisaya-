import type { ExceptionPosition } from "../types/exception.types";

export class InterpreterException extends Error {
  position?: ExceptionPosition;

  constructor(message: string, position?: ExceptionPosition) {
    const posInfo = position
      ? ` at line ${position.line}, column ${position.column}`
      : "";
    super(`${message}${posInfo}`);
    this.name = "InterpreterException";
    this.position = position;
    Object.setPrototypeOf(this, InterpreterException.prototype); // Fix prototype chain
  }
}

export class InvalidVariableTypeError extends InterpreterException {
  constructor(message: string, position?: ExceptionPosition) {
    super(`Invalid variable type: ${message}`, position);
    this.name = "InvalidVariableTypeError";
    Object.setPrototypeOf(this, InvalidVariableTypeError.prototype); // Fix prototype chain
  }
}

export class InvalidInputLengthException extends InterpreterException {
  constructor(message: string, position?: ExceptionPosition) {
    super(`Invalid input length: ${message}`, position);
    this.name = "InvalidInputLengthException";
    Object.setPrototypeOf(this, InvalidInputLengthException.prototype);
  }
}

export class UndefinedVariableException extends InterpreterException {
  constructor(variableName: string, position?: ExceptionPosition) {
    super(
      `Variable "${variableName}" is undefined or not initialized`,
      position,
    );
    this.name = "UndefinedVariableException";
    Object.setPrototypeOf(this, UndefinedVariableException.prototype);
  }
}

export class DivisionByZeroException extends InterpreterException {
  constructor(position?: ExceptionPosition) {
    super("Cannot divide by zero", position);
    this.name = "DivisionByZeroException";
    Object.setPrototypeOf(this, DivisionByZeroException.prototype);
  }
}

export class InvalidOperationException extends InterpreterException {
  constructor(
    operation: string,
    types: string[],
    position?: ExceptionPosition,
  ) {
    super(
      `Invalid operation "${operation}" for types: ${types.join(", ")}`,
      position,
    );
    this.name = "InvalidOperationException";
    Object.setPrototypeOf(this, InvalidOperationException.prototype);
  }
}

export class RuntimeTypeError extends InterpreterException {
  constructor(
    expected: string,
    received: string,
    position?: ExceptionPosition,
  ) {
    super(
      `Type error: expected ${expected}, but received ${received}`,
      position,
    );
    this.name = "RuntimeTypeError";
    Object.setPrototypeOf(this, RuntimeTypeError.prototype);
  }
}

export class StackOverflowException extends InterpreterException {
  constructor(position?: ExceptionPosition) {
    super("Stack overflow: maximum call stack size exceeded", position);
    this.name = "StackOverflowException";
    Object.setPrototypeOf(this, StackOverflowException.prototype);
  }
}
