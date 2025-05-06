import { describe, expect, test } from "bun:test";
import { TokenType } from "../../consts/lexer/token-type";
import { tokenize } from "../../modules/lexer";

describe("Lexer", () => {
  test("tokenizes basic expressions correctly", () => {
    const input = "123 MUGNA <= <> > 23\n what_ever NUMERO OO O O x, y, z, abc";
    const tokens = tokenize(input);

    // console.log("Tokenized:", tokens);

    expect(tokens[0]?.type).toBe(TokenType.NUMERIC_LITERAL);
    expect(tokens[1]?.type).toBe(TokenType.VARIABLE_DECLARATION);
    expect(tokens[2]?.type).toBe(TokenType.ARITHMETIC_OPERATOR);
    expect(tokens[3]?.type).toBe(TokenType.ARITHMETIC_OPERATOR);
    expect(tokens[4]?.type).toBe(TokenType.ARITHMETIC_OPERATOR);
    expect(tokens[5]?.type).toBe(TokenType.NUMERIC_LITERAL);
    expect(tokens[6]?.type).toBe(TokenType.NEWLINE);
    expect(tokens[7]?.type).toBe(TokenType.IDENTIFIER);
    expect(tokens[8]?.type).toBe(TokenType.DATATYPE);
    expect(tokens[9]?.type).toBe(TokenType.BOOLEAN_LITERAL);
    expect(tokens[10]?.type).toBe(TokenType.LOGICAL_OPERATOR);
  });

  // test("tokenizes test cases from files", () => {
  //   // Get test cases using the existing readTestCases utility
  //   const testcases = readTestCases();
  //
  //   // Make sure we found some test cases
  //   expect(testcases.length).toBeGreaterThan(0);
  //
  //   for (const testcase of testcases) {
  //     console.log("Input:\n" + testcase.input);
  //     const tokens = tokenize(testcase.input);
  //     console.log("Tokenized:", tokens);
  //
  //     // Additional assertions could be added here if we have expected token outputs
  //     expect(tokens.length).toBeGreaterThan(0);
  //   }
  // });
});
