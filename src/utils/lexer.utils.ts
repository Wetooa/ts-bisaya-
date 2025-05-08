import type { Token, TokenType } from "../types/lexer.types";

/**
 * Checks if a character is an alphabetical character or underscore
 * @param char Character to check
 * @returns true if alphabetical or underscore, false otherwise
 */
export function isAlphaOrUnderscore(char: string): boolean {
  return /[a-zA-Z_]/.test(char);
}

/**
 * Checks if a character is a digit
 * @param char Character to check
 * @returns true if digit, false otherwise
 */
export function isDigit(char: string): boolean {
  return /\d/.test(char);
}

/**
 * Checks if a character is alphanumeric or underscore
 * @param char Character to check
 * @returns true if alphanumeric or underscore, false otherwise
 */
export function isAlphaNumOrUnderscore(char: string): boolean {
  return isAlphaOrUnderscore(char) || isDigit(char);
}

/**
 * Checks if a character is whitespace (space, tab, etc.)
 * @param char Character to check
 * @returns true if whitespace, false otherwise
 */
export function isSkippable(char: string): boolean {
  return /[\s\t\r]/.test(char) && char !== "\n";
}

/**
 * Checks if a character is a newline
 * @param char Character to check
 * @returns true if newline, false otherwise
 */
export function isNewLine(char: string): boolean {
  return char === "\n";
}

/**
 * Creates a token object with the specified type and value
 * @param type The token type
 * @param value The token value
 * @returns A new Token object
 */
export function createToken(type: TokenType, value: string): Token {
  return {
    type,
    value,
  };
}
