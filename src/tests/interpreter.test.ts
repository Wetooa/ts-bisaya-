import { describe, expect, test, beforeEach, mock } from "bun:test";
import { run } from "..";
import { readTestCases } from "../utils/interpreter.utils";
import { Interpreter } from "../modules/interpreter/interpreter";
import { Tokenizer } from "../modules/lexer/tokenizer";
import { Parser } from "../modules/parser/parser";
import {
  InvalidInputLengthException,
  InvalidVariableTypeError,
} from "../exceptions/interpreter.exceptions";
import readlineSync from "readline-sync";

// Mock readline-sync to control inputs
mock.module("readline-sync", () => ({
  question: mock(() => "10"),
}));

describe("Interpreter", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

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
    const testcases = readTestCases(1);

    for (const testcase of testcases) {
      // const output = run(testcase.input);
      // expect(output).toBe(testcase.output);
    }
  });

  test("Simple numeric expression evaluation", () => {
    const source = "SUGOD\n IPAKITA: 10 + 5\nKATAPUSAN";
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("15");
  });

  test("Variable declaration and output", () => {
    const source = "SUGOD\n MUGNA NUMERO x = 42\n IPAKITA: x\nKATAPUSAN";
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("42");
  });

  test("Multiple variable declarations and arithmetic", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 10
      MUGNA NUMERO b = 5
      MUGNA NUMERO c = a + b * 2
      IPAKITA: c
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("20");
  });

  test("String concatenation in output", () => {
    const source = `SUGOD
      MUGNA NUMERO num = 42
      IPAKITA: "The answer is: " & num
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("The answer is: 42");
  });

  test("If statement execution (true condition)", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 10
      KUNG (x > 5) PUNDOK {
        IPAKITA: "Greater than 5"
      }
      KUNG WALA PUNDOK {
        IPAKITA: "Not greater than 5"
      }
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    console.log("+=fwefwefwef", result, ast);

    expect(result).toBe("Greater than 5");
  });

  test("If statement execution (false condition)", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 3
      KUNG (x > 5) PUNDOK {
        IPAKITA: "Greater than 5"
      }
      KUNG WALA PUNDOK {
        IPAKITA: "Not greater than 5"
      }
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("Not greater than 5");
  });

  test("For loop execution", () => {
    const source = `SUGOD
      MUGNA NUMERO sum = 0
      MUGNA NUMERO i = 0
      ALANG SA (i = 1, i <= 5, i++)
      PUNDOK {
        sum = sum + i
      }
      IPAKITA: sum
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("15");
  });

  test("Boolean operations", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      MUGNA TINUOD c = a UG b
      MUGNA TINUOD d = a O b
      IPAKITA: c & " " & d
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("DILI OO");
  });

  test("Testing input statement", () => {
    // Mock readline
    readlineSync.question = mock(() => "42");

    const source = `SUGOD
      MUGNA NUMERO x
      DAWAT: x
      IPAKITA: x * 2
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("84");
    expect(readlineSync.question).toHaveBeenCalled();
  });

  test("Multiple inputs", () => {
    // Mock readline to return comma-separated values
    readlineSync.question = mock(() => "10, 20");

    const source = `SUGOD
      MUGNA NUMERO a, b
      DAWAT: a, b
      IPAKITA: a + b
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("30");
    expect(readlineSync.question).toHaveBeenCalled();
  });

  test("Nested if statements", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 10
      MUGNA NUMERO y = 20
      KUNG (x > 5) PUNDOK {
        KUNG (y > 15) PUNDOK {
          IPAKITA: "Both conditions met"
        }
        KUNG WALA PUNDOK {
          IPAKITA: "Only x > 5"
        }
      }
      KUNG WALA PUNDOK {
        IPAKITA: "x <= 5"
      }
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("Both conditions met");
  });

  test("Throws error for invalid input type", () => {
    readlineSync.question = mock(() => "not-a-number");

    const source = `SUGOD
      MUGNA NUMERO x
      DAWAT: x
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);

    expect(() => interpreter.interpret(ast)).toThrow(InvalidVariableTypeError);
  });

  test("Character literal operations", () => {
    const source = `SUGOD
      MUGNA LETRA c = 'A'
      IPAKITA: c
    KATAPUSAN`;
    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("A");
  });
});
