import { describe, expect, test } from "bun:test";
import { run } from "../../src/interpreter";
import { readTestCases } from "../../src/interpreter/utils/read-testcases";

describe("Interpreter", () => {
  test("Reads test cases correctly", () => {
    const testcases = readTestCases();

    // Verify we have test cases loaded
    expect(testcases.length).toBeGreaterThan(0);

    // Check that test cases have the expected structure
    for (const testcase of testcases) {
      expect(testcase).toHaveProperty("input");
      expect(testcase).toHaveProperty("output");
      expect(typeof testcase.input).toBe("string");
      expect(typeof testcase.output).toBe("string");
    }
  });

  test("Perfect Testcases", () => {
    const testcases = readTestCases();

    for (const testcase of testcases) {
      const output = run(testcase.input);
      expect(output).toBe(testcase.output);
    }
  });
});
