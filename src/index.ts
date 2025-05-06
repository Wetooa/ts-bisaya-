import { tokenize } from "./modules/lexer";
import { parse } from "./modules/parser";

const { createInterface } = await import("node:readline/promises");
const { stdin, stdout } = await import("node:process");
const rl = createInterface({ input: stdin, output: stdout });

async function repl() {
  console.log('Welcome to the REPL! Type "exit" to quit.');

  while (true) {
    const input = await rl.question("> ");
    if (input === "exit") {
      break;
    }

    const tokens = tokenize(input);
    const ast = parse(tokens);

    console.log(`You entered: ${input}`);
    console.log("Tokens:", tokens);
    console.log("AST:", ast);
  }

  rl.close();
  console.log("Goodbye!");
}

repl();
