import type { Token } from "../../types/lexer";

export class ParserException extends Error {
  constructor(message: string, line: number) {
    super(`Exception on line: ${line} >>> ${message}`);
    this.name = "ParserException";
  }
}

export class DataTypeMismatchException extends ParserException {
  constructor(expectedType: string, actualType: string, line: number) {
    super(`Expected type is "${expectedType}", got "${actualType}".`, line);
    this.name = "DataTypeMismatchException";
  }
}

export class UnexpectedTokenException extends ParserException {
  constructor(msg: string, line: number) {
    super(`Unexpected token: ${msg}`, line);
    this.name = "UnexpectedTokenException";
  }
}

export class IdentifierNotFoundException extends ParserException {
  constructor(identifier: string, line: number) {
    super(`Identifier "${identifier}" not found.`, line);
    this.name = "IdentifierNotFoundException";
  }
}

export class IdentifierRedeclarationException extends ParserException {
  constructor(identifier: Token, line: number) {
    super(`Identifier "${identifier.value}" has already been declared.`, line);
    this.name = "IdentifierRedeclarationException";
  }
}

export class DatatypeNotFoundException extends ParserException {
  constructor(dataType: string, line: number) {
    super(`Data type "${dataType}" not found.`, line);
    this.name = "DatatypeNotFoundException";
  }
}

export class InvalidCodeBlocksException extends ParserException {
  constructor(line: number) {
    super(`Invalid code blocks.`, line);
    this.name = "InvalidCodeBlocksException";
  }
}
