import { Interpreter } from "./modules/interpreter/interpreter";
import { Tokenizer } from "./modules/lexer/tokenizer";
import { Parser } from "./modules/parser/parser";

export function run(input: string, isRepl = false) {
  console.log(`You entered: ${input}`);
  const lexer = new Tokenizer(isRepl);
  const parser = new Parser(isRepl);
  const interpreter = new Interpreter(isRepl);
  let output = "";

  try {
    const tokens = lexer.tokenize(input);
    console.log("Tokens:", tokens);

    const ast = parser.parse(tokens);
    console.log("AST:", ast);

    output = interpreter.interpret(ast);
    console.log("Output:", output);
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }

  return output;
}
