export class LexerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LexerException";
  }
}

export class UnknownCharacterException extends LexerException {
  constructor() {
    super("Unknown character encountered");
    this.name = "UnknownCharacterException";
  }
}

export class InvalidTokenizerStateException extends LexerException {
  constructor() {
    super("Invalid tokenizer state");
    this.name = "InvalidTokenizerStateException";
  }
}
