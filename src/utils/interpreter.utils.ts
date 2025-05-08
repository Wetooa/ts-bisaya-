import fs from "fs";

import path from "path";
import { InterpreterException } from "../exceptions/interpreter.exceptions";
import type TestCase from "../types/interpreter.types";

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

const TESTCASE_LIMIT = 100;

/**
 * Gets the absolute path to the project root directory
 * Works regardless of the current working directory
 */
function getProjectRoot(): string {
  return path.resolve(process.cwd());
}

export function readTestCases(count = TESTCASE_LIMIT): TestCase[] {
  const testcases: TestCase[] = [];
  const projectRoot = getProjectRoot();

  // Read all test cases up to the limit
  for (let i = 1; i <= count; i++) {
    try {
      const inputPath = path.join(
        projectRoot,
        "src/testcases/input",
        `${i}.txt`,
      );
      const outputPath = path.join(
        projectRoot,
        "src/testcases/output",
        `${i}.txt`,
      );

      if (fileExists(inputPath) && fileExists(outputPath)) {
        const input = readFile(inputPath);
        const output = readFile(outputPath);
        testcases.push({ input, output });
      }
    } catch (error) {
      throw new InterpreterException(`Failed to read test case ${i}: ${error}`);
    }
  }

  return testcases;
}
