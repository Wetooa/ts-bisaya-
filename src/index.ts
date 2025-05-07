import { interpret } from "./modules/interpreter";
import { tokenize } from "./modules/lexer";
import { parse } from "./modules/parser";
import { readTestCases } from "./utils/interpreter/read-testcases";

import readlineSync from "readline-sync";

async function repl() {
  console.log('Welcome to the REPL! Type "exit" to quit.');

  while (true) {
    const input = readlineSync.question("> ") + "\n";

    if (input === "exit") {
      break;
    }

    run(input, true);
  }

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
    throw new Error(`Error: ${error}`);
  }

  return output;
}

repl();

function main() {
  const testcases = readTestCases();

  run(testcases[8]!.input, false);
}

// main();
