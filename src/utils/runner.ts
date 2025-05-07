#!/usr/bin/env bun

import { readFileSync } from "fs";
import path from "path";
import { tokenize } from "../modules/lexer";
import { parse } from "../modules/parser";
import { interpret } from "../modules/interpreter";

/**
 * Runner utility to execute Bisaya code from a .txt file
 * Usage: bun run src/utils/runner.ts <path-to-file.txt>
 */

// Get file path from command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: bun run src/utils/runner.ts <path-to-file.txt>");
  process.exit(1);
}

const filePath = args[0];

try {
  // Read the file
  const fileContent = readFileSync(path.resolve(process.cwd(), filePath), {
    encoding: "utf-8",
  });

  console.log(`Executing Bisaya code from: ${filePath}`);

  // Execute the code
  console.log("Starting tokenization...");
  const tokens = tokenize(fileContent);
  console.log("Tokenization successful. Generated tokens:", tokens.length);

  console.log("\nStarting parsing...");
  const ast = parse(tokens);
  console.log("Parsing successful");

  console.log("\nStarting interpretation...");
  const result = interpret(ast);

  // Display the output
  console.log("\n--- EXECUTION RESULT ---");
  console.log(result);
} catch (error) {
  console.error("\n--- ERROR EXECUTING BISAYA CODE ---");
  console.error(error.name + ":", error.message);
  console.error("\nStack trace:");
  console.error(error.stack);
  process.exit(1);
}
