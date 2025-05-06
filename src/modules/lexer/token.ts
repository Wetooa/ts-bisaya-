import type { Token } from "../../types/lexer/token";
import { TokenType } from "../../consts/lexer/token-type";

export function createToken(type: TokenType, value: string): Token {
  return {
    type,
    value,
  };
}
