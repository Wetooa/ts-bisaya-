const TESTCASE_LIMIT = 100;

import path from "path";
import type TestCase from "../../types/interpreter/testcase";
import { fileExists, readFile } from "./read-file";
import { InterpreterException } from "../../exceptions/interpreter";

/**
 * Gets the absolute path to the project root directory
 * Works regardless of the current working directory
 */
function getProjectRoot(): string {
  return path.resolve(process.cwd());
}

export function readTestCases(): TestCase[] {
  const testcases: TestCase[] = [];
  const projectRoot = getProjectRoot();

  // Read all test cases up to the limit
  for (let i = 1; i <= TESTCASE_LIMIT; i++) {
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
