import type { Token } from "../../types/lexer.types";
import { Tokenizer } from "./tokenizer";

// Helper function to maintain compatibility with existing code
export function tokenize(input: string, isRepl: boolean = false): Token[] {
  const tokenizer = new Tokenizer(input, isRepl);
  return tokenizer.tokenize();
}
