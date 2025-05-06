import { StateType, END_STATES } from "../../consts/lexer/state-type";
import { SKIPPABLE_SYMBOLS, SYMBOLS } from "../../consts/lexer/symbols";

export function isSymbol(c: string): boolean {
  return SYMBOLS.has(c);
}

export function isSkippable(c: string): boolean {
  return SKIPPABLE_SYMBOLS.has(c);
}

export function isEndState(stateType: StateType): boolean {
  return END_STATES.has(stateType);
}

export function isResetState(stateType: StateType): boolean {
  return isEndState(stateType) || stateType === StateType.START;
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
