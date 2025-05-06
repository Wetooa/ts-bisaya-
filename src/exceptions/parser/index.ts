import type { Token } from "../../types/lexer";

export class ParserException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParserException";
  }
}

export class DataTypeMismatchException extends ParserException {
  constructor(expectedType: string, actualType: string) {
    super(`Identifier is of type "${actualType}", expected "${expectedType}".`);
    this.name = "IdentifierMismatchException";
  }
}

export class UnexpectedTokenException extends ParserException {
  constructor(msg: string) {
    super(`Unexpected token: ${msg}`);
    this.name = "UnexpectedTokenException";
  }
}

export class IdentifierNotFoundException extends ParserException {
  constructor(identifier: Token) {
    super(`Identifier "${identifier.value}" not found.`);
    this.name = "IdentifierNotFoundException";
  }
}

export class IdentifierRedeclarationException extends ParserException {
  constructor(identifier: Token) {
    super(`Identifier "${identifier.value}" has already been declared.`);
    this.name = "IdentifierRedeclarationException";
  }
}

export class DatatypeNotFoundException extends ParserException {
  constructor(dataType: string) {
    super(`Data type "${dataType}" not found.`);
    this.name = "DatatypeNotFoundException";
  }
}
