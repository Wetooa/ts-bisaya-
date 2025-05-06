import { KEYWORDS } from "../../consts/lexer/keywords";
import { TokenType } from "../../consts/lexer/token-type";
import { LexerException } from "../../exceptions/lexer";
import type { Token } from "../../types/lexer";
import { isSkippable } from "../../utils/lexer";
import { createToken } from "./token";

export class Tokenizer {
  private input: string;
  private tokens: Token[] = [];
  private position = 0;
  private isRepl;

  constructor(input: string, isRepl: boolean) {
    this.input = input;
    this.isRepl = isRepl;
  }

  public tokenize(): Token[] {
    while (this.position < this.input.length) {
      const char = this.peek();

      // Skip whitespace except for newlines
      if (isSkippable(char) && char !== "\n") {
        this.advance();
        continue;
      }

      // Handle newlines
      if (char === "\n") {
        this.tokens.push(createToken("NEWLINE", "\n"));
        this.advance();
        continue;
      }

      // Handle identifiers and keywords
      if (this.isAlpha(char) || char === "_") {
        this.tokenizeIdentifier();
        continue;
      }

      // Handle numbers
      if (this.isDigit(char)) {
        this.tokenizeNumber();
        continue;
      }

      // Handle comments
      if (char === "-" && this.peek(1) === "-") {
        this.skipComment();
        continue;
      }

      // Handle strings with double quotes
      if (char === '"') {
        this.tokenizeString();
        continue;
      }

      // Handle character literals with single quotes
      if (char === "'") {
        this.tokenizeCharLiteral();
        continue;
      }

      // Handle escaped characters [...]
      if (char === "[") {
        this.tokenizeEscapedChar();
        continue;
      }

      // Handle operators and other symbols
      this.tokenizeSymbol();
    }

    this.tokens.push(createToken("EOF", "EOF"));
    return this.tokens;
  }

  private peek(offset = 0): string {
    if (this.position + offset >= this.input.length) {
      return "";
    }
    return this.input[this.position + offset]!;
  }

  private advance(count = 1): void {
    this.position += count;
  }

  private consumeChar(): string {
    if (this.position >= this.input.length) {
      throw new LexerException("Unexpected end of input");
    }
    return this.input[this.position++]!;
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private tokenizeIdentifier(): void {
    let value = "";
    while (this.isAlphaNumeric(this.peek()) || this.peek() === "_") {
      value += this.consumeChar();
    }

    // Check if it's a keyword
    if (value in KEYWORDS) {
      this.tokens.push(createToken(KEYWORDS[value] as TokenType, value));
    } else {
      this.tokens.push(createToken("IDENTIFIER", value));
    }
  }

  private tokenizeNumber(): void {
    let value = "";

    // Consume whole part
    while (this.isDigit(this.peek())) {
      value += this.consumeChar();
    }

    // Check for decimal part
    if (this.peek() === ".") {
      value += this.consumeChar(); // consume the dot

      // Consume decimal part
      while (this.isDigit(this.peek())) {
        value += this.consumeChar();
      }

      this.tokens.push(createToken("DECIMAL_NUMERIC_LITERAL", value));
    } else {
      this.tokens.push(createToken("WHOLE_NUMERIC_LITERAL", value));
    }
  }

  private skipComment(): void {
    this.advance(2); // Skip --
    while (this.peek() !== "\n" && this.position < this.input.length) {
      this.advance();
    }
  }

  private tokenizeString(): void {
    this.advance(); // Skip opening quote
    let value = "";

    while (this.peek() !== '"' && this.position < this.input.length) {
      if (this.peek() === "\n") {
        throw new LexerException("Unterminated string literal");
      }
      value += this.consumeChar();
    }

    if (this.position >= this.input.length) {
      throw new LexerException("Unterminated string literal");
    }

    this.advance(); // Skip closing quote

    // Check for boolean literals
    if (value === "OO" || value === "DILI") {
      this.tokens.push(createToken("BOOLEAN_LITERAL", value));
    } else {
      this.tokens.push(createToken("STRING", value));
    }
  }

  private tokenizeCharLiteral(): void {
    this.advance(); // Skip opening quote
    const charValue = this.consumeChar();

    if (this.peek() !== "'") {
      throw new LexerException("Expected closing single quote");
    }

    this.advance(); // Skip closing quote
    this.tokens.push(createToken("CHAR_LITERAL", charValue));
  }

  private tokenizeEscapedChar(): void {
    this.consumeChar(); // Get opening bracket

    if (this.position + 1 >= this.input.length) {
      throw new LexerException(
        "Invalid escaped character syntax, reached end of input",
      );
    }
    if (this.peek(1) !== "]") {
      throw new LexerException("Invalid escaped character syntax");
    }

    const value = this.consumeChar();
    this.consumeChar(); // Get closing bracket
    this.tokens.push(createToken("ESCAPED_CHAR", value));
  }

  private tokenizeSymbol(): void {
    const char = this.peek();

    switch (char) {
      case "(":
        this.tokens.push(createToken("OPEN_PARENTHESIS", char));
        this.advance();
        break;
      case ")":
        this.tokens.push(createToken("CLOSE_PARENTHESIS", char));
        this.advance();
        break;
      case ",":
        this.tokens.push(createToken("COMMA", char));
        this.advance();
        break;
      case ":":
        this.tokens.push(createToken("COLON", char));
        this.advance();
        break;
      case "&":
        this.tokens.push(createToken("AMPERSAND", char));
        this.advance();
        break;
      case "$":
        this.tokens.push(createToken("CARRIAGE_RETURN", char));
        this.advance();
        break;
      case "+":
      case "-":
      case "*":
      case "/":
      case "%":
        this.tokens.push(createToken("ARITHMETIC_OPERATOR", char));
        this.advance();
        break;
      case "=":
        if (this.peek(1) === "=") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", "=="));
          this.advance(2);
        } else {
          this.tokens.push(createToken("ASSIGNMENT_OPERATOR", char));
          this.advance();
        }
        break;
      case "<":
        if (this.peek(1) === "=") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", "<="));
          this.advance(2);
        } else if (this.peek(1) === ">") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", "<>"));
          this.advance(2);
        } else {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", char));
          this.advance();
        }
        break;
      case ">":
        if (this.peek(1) === "=") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", ">="));
          this.advance(2);
        } else {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", char));
          this.advance();
        }
        break;
      default:
        throw new LexerException(`Unknown character: ${char}`);
    }
  }
}

// Helper function to maintain compatibility with existing code
export function tokenize(input: string, isRepl: boolean = false): Token[] {
  const tokenizer = new Tokenizer(input, isRepl);
  return tokenizer.tokenize();
}
