import { interpret } from "./modules/interpreter";
import { tokenize } from "./modules/lexer";
import { parse } from "./modules/parser";

export function run(input: string, isRepl = false) {
  console.log(`You entered: ${input}`);
  let output = "";

  try {
    const tokens = tokenize(input, isRepl);
    console.log("Tokens:", tokens);

    const ast = parse(tokens, isRepl);
    console.log("AST:", ast);

    output = interpret(ast);
    console.log("Output:", output);
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }

  return output;
}
