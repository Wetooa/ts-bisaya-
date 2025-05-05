import type { TokenType } from "../../src/lexer/consts/token-type";

export interface Token {
  type: TokenType;
  value: string;
}
