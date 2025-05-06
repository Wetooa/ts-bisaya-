import { SKIPPABLE_SYMBOLS, SYMBOLS } from "../../consts/lexer/symbols";

export function isSymbol(c: string): boolean {
  return SYMBOLS.has(c);
}

export function isSkippable(c: string): boolean {
  return SKIPPABLE_SYMBOLS.has(c);
}

export function inputCleaning(input: string): string {
  return input.endsWith("\n") ? input : input + "\n";
}

export function isAlphaOrUnderscore(c: string): boolean {
  return /[a-zA-Z_]/.test(c);
}

export function isAlphaNumOrUnderscore(c: string): boolean {
  return /[a-zA-Z0-9_]/.test(c);
}
