import type { TokenType } from "../../consts/lexer/token-type";

export interface Token {
  type: TokenType;
  value: string;
}
