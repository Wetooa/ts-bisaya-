import type { ExceptionPosition } from "../types/exception.types";

export class LexerException extends Error {
  position?: ExceptionPosition;

  constructor(message: string, position?: ExceptionPosition) {
    const posInfo = position
      ? ` at line ${position.line}, column ${position.column}`
      : "";
    super(`${message}${posInfo}`);
    this.name = "LexerException";
    this.position = position;
    Object.setPrototypeOf(this, LexerException.prototype); // Fix prototype chain
  }
}

export class UnknownCharacterException extends LexerException {
  constructor(position?: ExceptionPosition) {
    super("Unknown character encountered", position);
    this.name = "UnknownCharacterException";
    Object.setPrototypeOf(this, UnknownCharacterException.prototype); // Fix prototype chain
  }
}

export class InvalidTokenizerStateException extends LexerException {
  constructor(details?: string, position?: ExceptionPosition) {
    super(`Invalid tokenizer state${details ? `: ${details}` : ""}`, position);
    this.name = "InvalidTokenizerStateException";
    Object.setPrototypeOf(this, InvalidTokenizerStateException.prototype); // Fix prototype chain
  }
}

export class UnterminatedStringException extends LexerException {
  constructor(position?: ExceptionPosition) {
    super("Unterminated string literal", position);
    this.name = "UnterminatedStringException";
    Object.setPrototypeOf(this, UnterminatedStringException.prototype);
  }
}

export class UnterminatedCharLiteralException extends LexerException {
  constructor(position?: ExceptionPosition) {
    super("Unterminated character literal", position);
    this.name = "UnterminatedCharLiteralException";
    Object.setPrototypeOf(this, UnterminatedCharLiteralException.prototype);
  }
}

export class EmptyCharLiteralException extends LexerException {
  constructor(position?: ExceptionPosition) {
    super("Empty character literal", position);
    this.name = "EmptyCharLiteralException";
    Object.setPrototypeOf(this, EmptyCharLiteralException.prototype);
  }
}

export class InvalidEscapedCharException extends LexerException {
  constructor(position?: ExceptionPosition) {
    super("Invalid escaped character syntax", position);
    this.name = "InvalidEscapedCharException";
    Object.setPrototypeOf(this, InvalidEscapedCharException.prototype);
  }
}

export class InvalidNumericLiteralException extends LexerException {
  constructor(details: string, position?: ExceptionPosition) {
    super(`Invalid numeric literal: ${details}`, position);
    this.name = "InvalidNumericLiteralException";
    Object.setPrototypeOf(this, InvalidNumericLiteralException.prototype);
  }
}
