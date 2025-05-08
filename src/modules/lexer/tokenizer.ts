import { KEYWORDS } from "../../constants/lexer/keywords";
import {
  EmptyCharLiteralException,
  InvalidEscapedCharException,
  InvalidNumericLiteralException,
  UnknownCharacterException,
  UnterminatedCharLiteralException,
  UnterminatedStringException,
} from "../../exceptions/lexer.exceptions";
import type { Token } from "../../types/lexer.types";
import {
  createToken,
  isAlphaNumOrUnderscore,
  isAlphaOrUnderscore,
  isDigit,
  isNewLine,
  isSkippable,
} from "../../utils/lexer.utils";
import { StringReader } from "./string-reader";

export class Tokenizer {
  private reader: StringReader;
  private tokens: Token[] = [];
  private isRepl: boolean;

  constructor(input: string, isRepl: boolean = false) {
    this.reader = new StringReader(input);
    this.isRepl = isRepl;
  }

  public tokenize(): Token[] {
    while (!this.reader.isAtEnd()) {
      const char = this.reader.peek();

      // Skip whitespace except for newlines
      if (isSkippable(char)) {
        this.reader.advance();
        continue;
      }

      // Handle newlines
      if (isNewLine(char)) {
        this.tokens.push(createToken("NEWLINE", "\n"));
        this.reader.advance();
        continue;
      }

      // Handle identifiers and keywords
      if (isAlphaOrUnderscore(char)) {
        this.tokenizeIdentifier();
        continue;
      }

      // Handle numbers
      if (isDigit(char)) {
        this.tokenizeNumber();
        continue;
      }

      // Handle comments
      if (char === "-" && this.reader.peek(1) === "-") {
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

  private tokenizeIdentifier(): void {
    let value = "";
    while (isAlphaNumOrUnderscore(this.reader.peek())) {
      value += this.reader.consumeChar();
    }

    // Check if it's a keyword
    if (value in KEYWORDS) {
      this.tokens.push(createToken(KEYWORDS[value]!, value));
    } else {
      this.tokens.push(createToken("IDENTIFIER", value));
    }
  }

  private tokenizeNumber(): void {
    let value = "";

    // Consume whole part
    while (isDigit(this.reader.peek())) {
      value += this.reader.consumeChar();
    }

    // Check for decimal part
    if (this.reader.peek() === ".") {
      value += this.reader.consumeChar(); // consume the dot

      // Must have at least one digit after decimal point
      if (!isDigit(this.reader.peek())) {
        throw new InvalidNumericLiteralException(
          "expected digit after decimal point",
          this.reader.getCurrentPosition(),
        );
      }

      // Consume decimal part
      while (isDigit(this.reader.peek())) {
        value += this.reader.consumeChar();
      }

      this.tokens.push(createToken("DECIMAL_NUMERIC_LITERAL", value));
    } else {
      this.tokens.push(createToken("WHOLE_NUMERIC_LITERAL", value));
    }
  }

  private skipComment(): void {
    this.reader.advance(2); // Skip --
    while (this.reader.peek() !== "\n" && !this.reader.isAtEnd()) {
      this.reader.advance();
    }
  }

  private tokenizeString(): void {
    const startPos = this.reader.getCurrentPosition();
    this.reader.advance(); // Skip opening quote
    let value = "";

    while (this.reader.peek() !== '"' && !this.reader.isAtEnd()) {
      if (this.reader.peek() === "\n") {
        throw new UnterminatedStringException(startPos);
      }
      value += this.reader.consumeChar();
    }

    if (this.reader.isAtEnd()) {
      throw new UnterminatedStringException(startPos);
    }

    this.reader.advance(); // Skip closing quote

    // Check for boolean literals
    if (value === "OO" || value === "DILI") {
      this.tokens.push(createToken("BOOLEAN_LITERAL", value));
    } else {
      this.tokens.push(createToken("STRING", value));
    }
  }

  private tokenizeCharLiteral(): void {
    const startPos = this.reader.getCurrentPosition();
    this.reader.advance(); // Skip opening quote

    // Check for empty character literal
    if (this.reader.peek() === "'") {
      throw new EmptyCharLiteralException(startPos);
    }

    const charValue = this.reader.consumeChar();

    if (this.reader.peek() !== "'") {
      throw new UnterminatedCharLiteralException(startPos);
    }

    this.reader.advance(); // Skip closing quote
    this.tokens.push(createToken("CHAR_LITERAL", charValue));
  }

  private tokenizeEscapedChar(): void {
    const startPos = this.reader.getCurrentPosition();
    this.reader.consumeChar(); // Get opening bracket

    if (this.reader.isAtEnd() || this.reader.peek(1) !== "]") {
      throw new InvalidEscapedCharException(startPos);
    }

    const value = this.reader.consumeChar();
    this.reader.consumeChar(); // Get closing bracket
    this.tokens.push(createToken("ESCAPED_CHAR", value));
  }

  private tokenizeSymbol(): void {
    const char = this.reader.peek();
    const currentPosition = this.reader.getCurrentPosition();

    switch (char) {
      case "(":
        this.tokens.push(createToken("OPEN_PARENTHESIS", char));
        this.reader.advance();
        break;
      case ")":
        this.tokens.push(createToken("CLOSE_PARENTHESIS", char));
        this.reader.advance();
        break;
      case "{":
        this.tokens.push(createToken("OPEN_CURLY_BRACE", char));
        this.reader.advance();
        break;
      case "}":
        this.tokens.push(createToken("CLOSE_CURLY_BRACE", char));
        this.reader.advance();
        break;
      case ",":
        this.tokens.push(createToken("COMMA", char));
        this.reader.advance();
        break;
      case ":":
        this.tokens.push(createToken("COLON", char));
        this.reader.advance();
        break;
      case "&":
        this.tokens.push(createToken("AMPERSAND", char));
        this.reader.advance();
        break;
      case "$":
        this.tokens.push(createToken("CARRIAGE_RETURN", "\n"));
        this.reader.advance();
        break;
      case "+":
        if (this.reader.peek(1) === char) {
          this.tokens.push(
            createToken(
              char === "+" ? "INCREMENT_OPERATOR" : "DECREMENT_OPERATOR",
              char + char,
            ),
          );
          this.reader.advance(2);
          break;
        }
        this.tokens.push(createToken("ARITHMETIC_OPERATOR", char));
        this.reader.advance();
        break;
      case "-":
        this.tokens.push(createToken("ARITHMETIC_OPERATOR", char));
        this.reader.advance();
        break;
      case "*":
      case "/":
      case "%":
        this.tokens.push(createToken("ARITHMETIC_OPERATOR", char));
        this.reader.advance();
        break;
      case "=":
        if (this.reader.peek(1) === "=") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", "=="));
          this.reader.advance(2);
        } else {
          this.tokens.push(createToken("ASSIGNMENT_OPERATOR", char));
          this.reader.advance();
        }
        break;
      case "<":
        if (this.reader.peek(1) === "=") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", "<="));
          this.reader.advance(2);
        } else if (this.reader.peek(1) === ">") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", "<>"));
          this.reader.advance(2);
        } else {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", char));
          this.reader.advance();
        }
        break;
      case ">":
        if (this.reader.peek(1) === "=") {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", ">="));
          this.reader.advance(2);
        } else {
          this.tokens.push(createToken("RELATIONAL_OPERATOR", char));
          this.reader.advance();
        }
        break;
      default:
        throw new UnknownCharacterException(currentPosition);
    }
  }
}
