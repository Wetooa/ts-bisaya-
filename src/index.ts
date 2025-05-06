import { interpret } from "./modules/interpreter";
import { tokenize } from "./modules/lexer";
import { parse } from "./modules/parser";

const { createInterface } = await import("node:readline/promises");
const { stdin, stdout } = await import("node:process");
const rl = createInterface({ input: stdin, output: stdout });

async function repl() {
  console.log('Welcome to the REPL! Type "exit" to quit.');

  while (true) {
    const input = (await rl.question("> ")) + "\n";

    if (input === "exit") {
      break;
    }

    run(input, true);
  }

  rl.close();
  console.log("Goodbye!");
}

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
    console.error("Error:", error);
  }

  return output;
}

repl();
