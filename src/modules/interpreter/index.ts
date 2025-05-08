import type { Program } from "../../types/parser.types";
import { Interpreter } from "./interpreter";

// Factory function for backward compatibility
export function interpret(program: Program): string {
  const interpreter = new Interpreter(program);
  return interpreter.interpret();
}
