import readlineSync from "readline-sync";
import { Interpreter } from "./modules/interpreter/interpreter";
import { Tokenizer } from "./modules/lexer/tokenizer";
import { Parser } from "./modules/parser/parser";

async function repl() {
  console.log('Welcome to the REPL! Type "exit" to quit.');
  const lexer = new Tokenizer(true);
  const parser = new Parser(true);
  const interpreter = new Interpreter();

  while (true) {
    const input = readlineSync.question("> ") + "\n";

    if (input === "exit") {
      break;
    }

    try {
      const tokens = lexer.tokenize(input);
      const ast = parser.parse(tokens);
      const output = interpreter.interpret(ast);
      console.log(output);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }

  console.log("Goodbye!");
}

repl();
