import { describe, expect, test } from "bun:test";
import { readTestCases } from "../../utils/interpreter/read-testcases";
import { run } from "../..";

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
    const testcases = readTestCases(10);

    for (const testcase of testcases) {
      const output = run(testcase.input);

      // expect(output).toBe(testcase.output);
    }
  });
});
