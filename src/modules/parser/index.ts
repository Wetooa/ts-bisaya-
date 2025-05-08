import type { Token } from "../../types/lexer.types";
import type { Program } from "../../types/parser.types";
import { Parser } from "./parser";

export function parse(tokens: Token[], isRepl = false): Program {
  const parser = new Parser(tokens, isRepl);
  return parser.parse();
}
