import { InvalidTokenizerStateException } from "../../exceptions/lexer.exceptions";
import type { ExceptionPosition } from "../../types/exception.types";

/**
 * StringReader class handles character-by-character reading of input strings
 * with tracking of position (line, column) information.
 */
export class StringReader {
  private input: string;
  private index = 0;
  private line = 1;
  private column = 0;

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Look ahead at a character without advancing the position
   * @param offset Number of characters to look ahead (default: 0)
   * @returns The character at current position + offset, or empty string if beyond input length
   */
  public peek(offset = 0): string {
    if (this.index + offset >= this.input.length) {
      return "";
    }
    return this.input[this.index + offset]!;
  }

  /**
   * Advance the current position by a specified count
   * @param count Number of characters to advance (default: 1)
   */
  public advance(count = 1): void {
    for (let i = 0; i < count; i++) {
      if (this.index < this.input.length) {
        if (this.peek() === "\n") {
          this.line++;
          this.column = 0;
        } else {
          this.column++;
        }
        this.index++;
      }
    }
  }

  /**
   * Get the current position in the input string
   * @returns Position object containing line and column
   */
  public getCurrentPosition(): ExceptionPosition {
    return { line: this.line, column: this.column };
  }

  /**
   * Consume the current character and advance the position
   * @returns The consumed character
   * @throws InvalidTokenizerStateException if attempting to read beyond the end of input
   */
  public consumeChar(): string {
    if (this.index >= this.input.length) {
      throw new InvalidTokenizerStateException(
        "Unexpected end of input",
        this.getCurrentPosition(),
      );
    }
    const char = this.input[this.index];
    this.advance();
    return char!;
  }

  /**
   * Check if we've reached the end of the input
   * @returns true if at end of input, false otherwise
   */
  public isAtEnd(): boolean {
    return this.index >= this.input.length;
  }
}
