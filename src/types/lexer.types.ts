import type { TokenType } from "../constants/lexer/token-type";
export type TokenType = (typeof TokenType)[number];

export interface Token {
  type: TokenType;
  value: string;
}
