import { UnexpectedTokenException } from "../../exceptions/parser.exceptions";
import type { Token, TokenType } from "../../types/lexer.types";
import type { ExceptionPosition } from "../../types/exception.types";

/**
 * TokenReader class handles token-by-token reading of token arrays
 * with tracking of position information.
 */
export class TokenReader {
  private tokens: Token[] = [];
  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Look ahead at a token without advancing the position
   * @param offset Number of tokens to look ahead (default: 0)
   * @returns The token at current position + offset, or undefined if beyond tokens length
   */
  public peek(offset = 0): Token | undefined {
    const index = this.index + offset;
    return index < this.tokens.length ? this.tokens[index] : undefined;
  }

  /**
   * Get the current token
   * @returns The current token
   */
  public getCurrentToken(): Token {
    return this.peek() as Token;
  }

  /**
   * Advance the current position by a specified count
   * @param count Number of tokens to advance (default: 1)
   */
  public advance(count = 1): void {
    this.index += count;
  }

  /**
   * Consume the current token and advance the position
   * @returns The consumed token
   */
  public eat(): Token {
    return this.tokens[this.index++] as Token;
  }

  /**
   * Check if we've reached the end of the tokens
   * @returns true if at end of tokens, false otherwise
   */
  public isEnd(): boolean {
    return this.getCurrentToken().type === "EOF";
  }

  /**
   * Get the current position for exception reporting
   * @returns Position object containing line and column
   */
  public getCurrentPosition(): ExceptionPosition {
    let line = 1;
    let column = 0;

    for (let i = 0; i < this.index; i++) {
      if (this.tokens[i]!.type === "NEWLINE") {
        line++;
        column = 0;
      } else {
        column += this.tokens[i]!.value.length;
      }
    }

    return { line, column };
  }

  /**
   * Expect a token of a specific type and consume it
   * @param tokenType Expected token type
   * @param errorMsg Error message if token type doesn't match
   * @returns The consumed token
   */
  public expectType(
    tokenType: TokenType,
    errorMsg = "Unexpected token type",
  ): Token {
    if (this.isEnd() || this.getCurrentToken().type === tokenType)
      return this.eat();
    throw new UnexpectedTokenException(errorMsg, this.getCurrentPosition());
  }

  /**
   * Expect a token with a specific value and consume it
   * @param tokenValue Expected token value
   * @param errorMsg Error message if token value doesn't match
   * @returns The consumed token
   */
  public expectValue(
    tokenValue: string,
    errorMsg = "Unexpected token value",
  ): Token {
    if (this.isEnd() || this.getCurrentToken().value === tokenValue)
      return this.eat();
    throw new UnexpectedTokenException(errorMsg, this.getCurrentPosition());
  }

  /**
   * Expect a token with a specific type and value and consume it
   * @param tokenType Expected token type
   * @param tokenValue Expected token value
   * @param errorMsg Error message if token doesn't match
   * @returns The consumed token
   */
  public expectTypeAndValue(
    tokenType: TokenType,
    tokenValue: string,
    errorMsg = "Unexpected token",
  ): Token {
    if (
      this.isEnd() ||
      (this.getCurrentToken().type === tokenType &&
        this.getCurrentToken().value === tokenValue)
    ) {
      return this.eat();
    }
    throw new UnexpectedTokenException(errorMsg, this.getCurrentPosition());
  }
}
