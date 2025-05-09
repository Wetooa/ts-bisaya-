import type { ExceptionPosition } from "../types/exception.types";

export class ParserException extends Error {
  position?: ExceptionPosition;

  constructor(message: string, position?: ExceptionPosition) {
    const posInfo = position
      ? ` at line ${position.line}, column ${position.column}`
      : "";
    super(`${message}${posInfo}`);
    this.name = "ParserException";
    this.position = position;
    Object.setPrototypeOf(this, ParserException.prototype); // Fix prototype chain
  }
}

export class DataTypeMismatchException extends ParserException {
  constructor(
    expectedType: string,
    actualType: string,
    position?: ExceptionPosition,
  ) {
    super(`Expected type is "${expectedType}", got "${actualType}".`, position);
    this.name = "DataTypeMismatchException";
    Object.setPrototypeOf(this, DataTypeMismatchException.prototype); // Fix prototype chain
  }
}

export class UnexpectedTokenException extends ParserException {
  constructor(msg: string, position?: ExceptionPosition) {
    super(`Unexpected token: ${msg}`, position);
    this.name = "UnexpectedTokenException";
    Object.setPrototypeOf(this, UnexpectedTokenException.prototype); // Fix prototype chain
  }
}

export class IdentifierNotFoundException extends ParserException {
  constructor(identifier: string, position?: ExceptionPosition) {
    super(`Identifier "${identifier}" not found.`, position);
    this.name = "IdentifierNotFoundException";
    Object.setPrototypeOf(this, IdentifierNotFoundException.prototype); // Fix prototype chain
  }
}

export class IdentifierRedeclarationException extends ParserException {
  constructor(identifier: string, position?: ExceptionPosition) {
    super(`Identifier "${identifier}" has already been declared.`, position);
    this.name = "IdentifierRedeclarationException";
    Object.setPrototypeOf(this, IdentifierRedeclarationException.prototype); // Fix prototype chain
  }
}

export class DatatypeNotFoundException extends ParserException {
  constructor(dataType: string, position?: ExceptionPosition) {
    super(`Data type "${dataType}" not found.`, position);
    this.name = "DatatypeNotFoundException";
    Object.setPrototypeOf(this, DatatypeNotFoundException.prototype); // Fix prototype chain
  }
}

export class InvalidCodeBlocksException extends ParserException {
  constructor(position?: ExceptionPosition) {
    super(`Invalid code blocks.`, position);
    this.name = "InvalidCodeBlocksException";
    Object.setPrototypeOf(this, InvalidCodeBlocksException.prototype); // Fix prototype chain
  }
}

export class MustEndWithKatapusanException extends ParserException {
  constructor(position?: ExceptionPosition) {
    super(`Code must end with "KATAPUSAN".`, position);
    this.name = "MustEndWithKatapusanException";
    Object.setPrototypeOf(this, MustEndWithKatapusanException.prototype); // Fix prototype chain
  }
}

export class MustStartWithSugodException extends ParserException {
  constructor(position?: ExceptionPosition) {
    super(`Code must start with "SUGOD".`, position);
    this.name = "MustStartWithSugodException";
    Object.setPrototypeOf(this, MustStartWithSugodException.prototype); // Fix prototype chain
  }
}
