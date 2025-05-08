import readlineSync from "readline-sync";
import { run } from ".";

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

repl();
