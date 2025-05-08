import { beforeEach, describe, expect, mock, test } from "bun:test";
import readlineSync from "readline-sync";
import { InvalidVariableTypeError } from "../exceptions/interpreter.exceptions";
import { Interpreter } from "../modules/interpreter/interpreter";
import { Tokenizer } from "../modules/lexer/tokenizer";
import { Parser } from "../modules/parser/parser";
import { readTestCases } from "../utils/interpreter.utils";

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

  test("Fibonacci sequence calculation", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 10
      MUGNA NUMERO a = 0
      MUGNA NUMERO b = 1
      MUGNA NUMERO temp
      MUGNA NUMERO i = 1
      
      ALANG SA (i = 1, i < n, i++)
      PUNDOK {
        temp = a + b
        a = b
        b = temp
      }
      
      IPAKITA: b
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("55"); // The 10th Fibonacci number
  });

  test("Prime number checker", () => {
    const source = `SUGOD
      MUGNA NUMERO num = 17
      MUGNA TINUOD isPrime = "OO"
      MUGNA NUMERO i = 2
      
      KUNG (num <= 1) PUNDOK {
        isPrime = "DILI"
      }
      
      ALANG SA (i = 2, i * i <= num, i++)
      PUNDOK {
        KUNG (num % i == 0) PUNDOK {
          isPrime = "DILI"
        }
      }
      
      IPAKITA: isPrime
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // 17 is prime
  });

  test("FizzBuzz implementation", () => {
    readlineSync.question = mock(() => "15");

    const source = `SUGOD
      MUGNA NUMERO n
      DAWAT: n
      MUGNA NUMERO i = 1
      MUGNA NUMERO sum = 0
      
      ALANG SA (i = 1, i <= n, i++)
      PUNDOK {
        KUNG (i % 3 == 0 UG i % 5 == 0) PUNDOK {
          sum = sum + i
        }
        KUNG DILI (i % 3 == 0) PUNDOK {
          sum = sum + 1
        }
        KUNG DILI (i % 5 == 0) PUNDOK {
          sum = sum + 5
        }
      }
      
      IPAKITA: sum
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    // Modified FizzBuzz that sums:
    // - numbers divisible by both 3 and 5 (add the number itself)
    // - numbers divisible by 3 only (add 1)
    // - numbers divisible by 5 only (add 5)
    // - other numbers (add 0)
    // For range 1-15, should be: 0+2+1+1+0+1+0+1+1+5+0+1+0+1+15 = 29
    expect(result).toBe("29");
  });

  test("Factorial calculation", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 5
      MUGNA NUMERO factorial = 1
      MUGNA NUMERO i
      
      ALANG SA (i = 1, i <= n, i++)
      PUNDOK {
        factorial = factorial * i
      }
      
      IPAKITA: factorial
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("120"); // 5! = 120
  });

  test("Bubble sort implementation", () => {
    // Since we can't have arrays directly, we'll sort 5 variables
    const source = `SUGOD
      MUGNA NUMERO a = 5
      MUGNA NUMERO b = 2
      MUGNA NUMERO c = 8
      MUGNA NUMERO d = 1
      MUGNA NUMERO e = 9
      MUGNA NUMERO temp
      MUGNA NUMERO i, j
      
      ALANG SA (i = 0, i < 4, i++)
      PUNDOK {
        -- First comparison: a and b
        KUNG (a > b) PUNDOK {
          temp = a
          a = b
          b = temp
        }
        
        -- Second comparison: b and c
        KUNG (b > c) PUNDOK {
          temp = b
          b = c
          c = temp
        }
        
        -- Third comparison: c and d
        KUNG (c > d) PUNDOK {
          temp = c
          c = d
          d = temp
        }
        
        -- Fourth comparison: d and e
        KUNG (d > e) PUNDOK {
          temp = d
          d = e
          e = temp
        }
      }
      
      IPAKITA: a & "," & b & "," & c & "," & d & "," & e
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("1,2,5,8,9"); // Sorted values
  });

  test("GCD calculation using Euclidean algorithm", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 48
      MUGNA NUMERO b = 18
      MUGNA NUMERO temp
      
      ALANG SA (b, b <> 0, b)
      PUNDOK {
        a = a % b
        temp = b
        b = a
        a = temp
      }
      
      IPAKITA: a
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("6"); // GCD of 48 and 18 is 6
  });

  test("Armstrong number check", () => {
    const source = `SUGOD
      MUGNA NUMERO num = 153
      MUGNA NUMERO original = num
      MUGNA NUMERO sum = 0
      MUGNA NUMERO digit
      
      ALANG SA (num, num > 0, num = num / 10)
      PUNDOK {
        digit = num % 10
        sum = sum + (digit * digit * digit)
      }

      IPAKITA: sum & $
      
      KUNG (sum == original) PUNDOK {
        IPAKITA: "OO"
      }
      KUNG WALA PUNDOK {
        IPAKITA: "DILI"
      }
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("153\nOO"); // 153 is an Armstrong number (1³ + 5³ + 3³ = 153)
  });

  // NOTE: commented for now as the interpreter does not support arrays yet
  // test("Pascal's triangle row calculation", () => {
  //   const source = `SUGOD
  //     MUGNA NUMERO n = 5  -- Calculate the 5th row (0-indexed)
  //     MUGNA NUMERO prev = 1
  //     MUGNA NUMERO curr
  //     MUGNA NUMERO i = 0
  //     MUGNA NUMERO j = 0
  //     IPAKITA: "1,"
  //
  //     -- Calculate binomial coefficients for nth row
  //     ALANG SA (j = 1, j <= n, j++)
  //     PUNDOK {
  //       curr = (prev * (n - j + 1)) / j
  //       IPAKITA: curr & ","
  //       prev = curr
  //     }
  //
  //   KATAPUSAN`;
  //
  //   const tokens = new Tokenizer().tokenize(source);
  //   const ast = new Parser().parse(tokens);
  //   const result = interpreter.interpret(ast);
  //
  //   expect(result).toBe("1,5,10,10,5,1,"); // 5th row of Pascal's triangle
  // });

  test("Complex nested conditions", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 7
      MUGNA NUMERO y = 3
      MUGNA NUMERO z = 10
      
      KUNG (x > 5) PUNDOK {
        KUNG (y < 5) PUNDOK {
          KUNG (z == 10) PUNDOK {
            IPAKITA: "Path 1"
          }
          KUNG WALA PUNDOK {
            IPAKITA: "Path 2"
          }
        }
        KUNG WALA PUNDOK {
          IPAKITA: "Path 3"
        }
      }
      KUNG WALA PUNDOK {
        KUNG (y > 0) PUNDOK {
          IPAKITA: "Path 4"
        }
        KUNG WALA PUNDOK {
          IPAKITA: "Path 5"
        }
      }
      
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("Path 1");
  });

  test("Prime factorization", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 84
      MUGNA NUMERO i = 2
      
      ALANG SA (i <= n, i <= n, i = i)
      PUNDOK {
        KUNG (n % i == 0) PUNDOK {
          IPAKITA: i & ","
          n = n / i
        }
        KUNG WALA PUNDOK {
          i = i + 1
        }
      }
      
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2,2,3,7,"); // 84 = 2² × 3 × 7
  });

  test("Digital root calculation", () => {
    const source = `SUGOD
      MUGNA NUMERO num = 9875
      MUGNA NUMERO sum
      
      ALANG SA (num > 9, num > 9, num = sum)
      PUNDOK {
        sum = 0
        ALANG SA (num > 0, num > 0, num = num / 10)
        PUNDOK {
          sum = sum + (num % 10)
        }
      }
      
      IPAKITA: num
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2"); // Digital root of 9875 is 2 (9+8+7+5=29, 2+9=11, 1+1=2)
  });

  test("Collatz conjecture steps", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 27
      MUGNA NUMERO steps = 0
      
      ALANG SA (n, n <> 1, n)
      PUNDOK {
        KUNG (n % 2 == 0) PUNDOK {
          n = n / 2
        }
        KUNG WALA PUNDOK {
          n = 3 * n + 1
        }
        steps = steps + 1
      }
      
      IPAKITA: steps
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("111"); // It takes 111 steps for 27 to reach 1 in the Collatz sequence
  });

  test("Triangular number calculation", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 10
      MUGNA NUMERO sum = 0
      MUGNA NUMERO i = 1
      
      ALANG SA (i <= n, i <= n, i++)
      PUNDOK {
        sum = sum + i
      }
      
      IPAKITA: sum
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("55"); // The 10th triangular number is 55 (1+2+3+...+10)
  });

  test("Perfect number checker", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 28
      MUGNA NUMERO sum = 0
      MUGNA NUMERO i = 1
      
      ALANG SA (i < n, i < n, i++)
      PUNDOK {
        KUNG (n % i == 0) PUNDOK {
          sum = sum + i
        }
      }
      
      KUNG (sum == n) PUNDOK {
        IPAKITA: "OO"
      }
      KUNG WALA PUNDOK {
        IPAKITA: "DILI"
      }
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // 28 is a perfect number (1+2+4+7+14=28)
  });

  test("Boolean logic operations - De Morgan's laws", () => {
    const source = `SUGOD
      MUGNA TINUOD p = "OO"
      MUGNA TINUOD q = "DILI"
      MUGNA TINUOD result1
      MUGNA TINUOD result2
      
      -- ¬(p ∧ q) ≡ ¬p ∨ ¬q
      result1 = DILI(p UG q)
      result2 = (DILI p) O (DILI q)

      KUNG (result1 == result2) PUNDOK {
        IPAKITA: "OO"
      }
      KUNG WALA PUNDOK {
        IPAKITA: "DILI"
      }
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // Verifies De Morgan's law
  });

  test("Expression with complex precedence", () => {
    const source = `SUGOD
      IPAKITA: 2 + 3 * 4 - 8 / 2
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("10"); // 2 + (3 * 4) - (8 / 2) = 2 + 12 - 4 = 10
  });

  test("Parenthesized expressions", () => {
    const source = `SUGOD
      IPAKITA: (2 + 3) * (4 - 1)
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("15"); // (2 + 3) * (4 - 1) = 5 * 3 = 15
  });

  test("Multiple binary operations in a row", () => {
    const source = `SUGOD
      IPAKITA: 10 - 5 - 3
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2"); // (10 - 5) - 3 = 5 - 3 = 2
  });

  test("Complex mixed operations with variables", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 5
      MUGNA NUMERO b = 3
      MUGNA NUMERO c = 2
      IPAKITA: a * b + c * (a - b)
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("19"); // 5*3 + 2*(5-3) = 15 + 2*2 = 15 + 4 = 19
  });

  test("Chain of relational operators", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 5
      MUGNA NUMERO b = 3
      MUGNA TINUOD result = a > b UG a == 5 O b == 2
      IPAKITA: result
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // (5 > 3) AND (5 == 5) OR (3 == 2) = true AND true OR false = true
  });

  test("Unary operators in expressions", () => {
    const source = `SUGOD
      MUGNA NUMERO a = -5
      MUGNA NUMERO b = +3
      IPAKITA: -a + b
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("8"); // -(-5) + 3 = 5 + 3 = 8
  });

  test("Boolean logic with negation", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      IPAKITA: DILI(a UG b) == ((DILI a) O (DILI b))
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // Testing De Morgan's laws: NOT(A AND B) = (NOT A) OR (NOT B)
  });

  test("Modulo operations", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 17
      MUGNA NUMERO b = 5
      IPAKITA: a % b
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2"); // 17 % 5 = 2
  });

  test("Integer division", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 17
      MUGNA NUMERO b = 5
      IPAKITA: a / b
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("3"); // Integer division of 17/5 = 3
  });

  test("Floating point arithmetic with precedence", () => {
    const source = `SUGOD
      MUGNA TIPIK a = 5.5
      MUGNA TIPIK b = 2.5
      MUGNA TIPIK c = 1.5
      IPAKITA: a + b * c - a / b
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("7.05"); // 5.5 + (2.5 * 1.5) - (5.5 / 2.5) = 5.5 + 3.75 - 2.2 = 7.05
  });

  test("Complex nested parentheses", () => {
    const source = `SUGOD
      IPAKITA: (2 + 3) * (4 - (1 + 1)) + 7
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("17"); // (2 + 3) * (4 - (1 + 1)) + 7 = 5 * 2 + 7 = 10 + 7 = 17
  });

  test("Mixed operators with boolean result", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 10
      MUGNA NUMERO b = 5
      MUGNA NUMERO c = 20
      IPAKITA: a > b UG b * 4 == c
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // (10 > 5) AND (5 * 4 == 20) = true AND true = true
  });

  test("Complex boolean logic with parentheses", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      MUGNA TINUOD c = "OO"
      IPAKITA: (a O b) UG (b O c)
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // (true OR false) AND (false OR true) = true AND true = true
  });

  test("Comparison chain with mixed arithmetic", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 10
      MUGNA NUMERO y = 5
      IPAKITA: x - y > y * 0 UG x / y == 2
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // (10-5 > 5*0) AND (10/5 == 2) = (5 > 0) AND (2 == 2) = true AND true = true
  });

  test("Multiple negations in boolean expressions", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO" 
      MUGNA TINUOD b = "DILI"
      IPAKITA: DILI(DILI(a) UG DILI(b))
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // NOT(NOT(true) AND NOT(false)) = NOT(false AND true) = NOT(false) = true
  });

  test("Mixed arithmetic operators with different precedence", () => {
    const source = `SUGOD
      IPAKITA: 2 + 3 * 4 % 5 - 6 / 3
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2"); // 2 + ((3 * 4) % 5) - (6 / 3) = 2 + (12 % 5) - 2 = 2 + 2 - 2 = 2
  });

  test("Unary operations with parentheses", () => {
    const source = `SUGOD
      IPAKITA: -(-(5 + 3))
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("8"); // -(-(5 + 3)) = -(-(8)) = -((-8)) = 8
  });

  test("Complex nested arithmetic with unary operators", () => {
    const source = `SUGOD
      IPAKITA: 2 * -3 + 4 * -(1 + 2)
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("-18"); // 2 * -3 + 4 * -(1 + 2) = -6 + 4 * -3 = -6 + -12 = -18
  });

  test("Unary negation with boolean expressions", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      IPAKITA: DILI(a) == b
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // NOT(true) == false = true
  });

  test("Mixed precedence with arithmetic, relational and logical operators", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 5
      MUGNA NUMERO y = 3
      IPAKITA: x + y * 2 > x * 2 UG y < x
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO");
  });

  test("Deeply nested arithmetic with mixed operators", () => {
    const source = `SUGOD
      IPAKITA: (2 + 3 * (4 - 1)) / (1 + 1) % 3
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2"); // (2 + 3 * (4 - 1)) / (1 + 1) % 3 = (2 + 3 * 3) / 2 % 3 = (2 + 9) / 2 % 3 = 11 / 2 % 3 = 5 % 3 = 2
  });

  test("Multiple boolean operations with different precedences", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      MUGNA TINUOD c = "OO"
      IPAKITA: DILI(a UG b) O DILI(b) UG c
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // NOT(true AND false) OR (NOT(false) AND true) = NOT(false) OR (true AND true) = true OR true = true
  });

  test("Complex expression with multiple unary operators and parentheses", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 10
      IPAKITA: -(-x) + -(-(x * 2))
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("30"); // -(-10) + -(-(10 * 2)) = 10 + 20 = 30
  });

  test("Arithmetic operator precedence with multiple terms", () => {
    const source = `SUGOD
      IPAKITA: 1 + 2 * 3 + 4 * 5
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("27"); // 1 + (2*3) + (4*5) = 1 + 6 + 20 = 27
  });

  test("Complex boolean logic with multiple operators", () => {
    const source = `SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      MUGNA TINUOD c = "OO"
      MUGNA TINUOD d = "DILI"
      IPAKITA: a UG b O c UG d
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("DILI"); // (true AND false) OR (true AND false) = false OR false = false
  });

  test("Mixed operators with different precedence levels", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 10
      MUGNA NUMERO y = 5
      IPAKITA: x - y * 2 + x / y
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("2"); // 10 - (5 * 2) + (10 / 5) = 10 - 10 + 2 = 2
  });

  test("Unary operations with variables", () => {
    const source = `SUGOD
      MUGNA NUMERO x = -7
      MUGNA NUMERO y = -3
      IPAKITA: -x * -y
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("21"); // -(-7) * -(-3) = 7 * 3 = 21
  });

  test("Deeply nested expressions with mixed operators", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 2
      MUGNA NUMERO b = 3
      MUGNA NUMERO c = 4
      IPAKITA: a * (b + c) / (a + b) * c - a
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("6"); // 2 * (3 + 4) / (2 + 3) * 4 - 2 = 2 * 7 / 5 * 4 - 2 = 14 / 5 * 4 - 2 = 2 * 4 - 2 = 8 - 2 = 6
  });

  test("Boolean operations with mixed precedence", () => {
    const source = `SUGOD
      MUGNA TINUOD p = "OO"
      MUGNA TINUOD q = "DILI"
      MUGNA TINUOD r = "OO"
      IPAKITA: p O q UG r
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // p OR (q AND r) = true OR (false AND true) = true OR false = true
  });

  test("Complex expression with all operators", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 5
      MUGNA NUMERO b = 3
      MUGNA TINUOD c = "OO"
      MUGNA TINUOD d = "DILI"
      IPAKITA: (a > b UG c) O (a < b UG d) O a + b == 8
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("OO"); // ((5 > 3) AND true) OR ((5 < 3) AND false) OR (5 + 3 == 8) = (true AND true) OR (false AND false) OR true = true OR false OR true = true
  });

  test("Binary search algorithm", () => {
    const source = `SUGOD
      MUGNA NUMERO target = 42
      MUGNA NUMERO arr1 = 10
      MUGNA NUMERO arr2 = 20
      MUGNA NUMERO arr3 = 30
      MUGNA NUMERO arr4 = 40
      MUGNA NUMERO arr5 = 42
      MUGNA NUMERO arr6 = 50
      MUGNA NUMERO arr7 = 60
      MUGNA NUMERO arr8 = 70
      MUGNA NUMERO arr9 = 80
      
      MUGNA NUMERO left = 1
      MUGNA NUMERO right = 9
      MUGNA NUMERO mid
      MUGNA TINUOD found = "DILI"
      MUGNA NUMERO foundIndex = -1
      
      ALANG SA (left <= right, left <= right, left)
      PUNDOK {
        mid = left + (right - left) / 2
        
        MUGNA NUMERO currentVal = -1
        KUNG (mid == 1) PUNDOK { currentVal = arr1 }
        KUNG (mid == 2) PUNDOK { currentVal = arr2 }
        KUNG (mid == 3) PUNDOK { currentVal = arr3 }
        KUNG (mid == 4) PUNDOK { currentVal = arr4 }
        KUNG (mid == 5) PUNDOK { currentVal = arr5 }
        KUNG (mid == 6) PUNDOK { currentVal = arr6 }
        KUNG (mid == 7) PUNDOK { currentVal = arr7 }
        KUNG (mid == 8) PUNDOK { currentVal = arr8 }
        KUNG (mid == 9) PUNDOK { currentVal = arr9 }
        
        KUNG (currentVal == target) PUNDOK {
          found = "OO"
          foundIndex = mid
          left = right + 1  -- break loop
        }
        KUNG DILI (currentVal < target) PUNDOK {
          right = mid - 1
        }
        KUNG WALA PUNDOK {
          left = mid + 1
        }
      }
      
      IPAKITA: foundIndex
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("5"); // Target value 42 is at index 5
  });

  test("Quadratic formula implementation", () => {
    const source = `SUGOD
      MUGNA TIPIK a = 1.0
      MUGNA TIPIK b = -5.0
      MUGNA TIPIK c = 6.0
      MUGNA TIPIK discriminant = b * b - 4.0 * a * c
      MUGNA TIPIK root1 = 0.0
      MUGNA TIPIK root2 = 0.0
      MUGNA TIPIK twoA = 2.0 * a
      MUGNA TINUOD hasRealRoots = "DILI"
      
      KUNG (discriminant >= 0) PUNDOK {
        hasRealRoots = "OO"
        MUGNA TIPIK sqrtDiscriminant = discriminant
        
        -- Simplified square root approximation using Newton's method
        MUGNA TIPIK x = discriminant / 2
        MUGNA NUMERO i = 0
        ALANG SA (i < 10, i < 10, i++)
        PUNDOK {
          x = 0.5 * (x + discriminant / x)
        }
        sqrtDiscriminant = x
        
        root1 = (-b + sqrtDiscriminant) / twoA
        root2 = (-b - sqrtDiscriminant) / twoA
      }
      
      -- Round to one decimal place (multiply by 10, truncate, divide by 10)
      MUGNA TIPIK roundedRoot1 = (root1 * 10) / 10
      MUGNA TIPIK roundedRoot2 = (root2 * 10) / 10
      
      IPAKITA: roundedRoot1 & ", " & roundedRoot2
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("3, 2"); // Roots of x^2 - 5x + 6 = 0 are 3 and 2
  });

  test("Matrix multiplication simulation", () => {
    const source = `SUGOD
      -- Matrix A: 2x2
      MUGNA NUMERO a11 = 1
      MUGNA NUMERO a12 = 2
      MUGNA NUMERO a21 = 3
      MUGNA NUMERO a22 = 4
      
      -- Matrix B: 2x2
      MUGNA NUMERO b11 = 5
      MUGNA NUMERO b12 = 6
      MUGNA NUMERO b21 = 7
      MUGNA NUMERO b22 = 8
      
      -- Matrix C = A * B
      MUGNA NUMERO c11 = a11 * b11 + a12 * b21
      MUGNA NUMERO c12 = a11 * b12 + a12 * b22
      MUGNA NUMERO c21 = a21 * b11 + a22 * b21
      MUGNA NUMERO c22 = a21 * b12 + a22 * b22
      
      IPAKITA: c11 & "," & c12 & ";" & c21 & "," & c22
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("19,22;43,50"); // Result of matrix multiplication
  });

  test("Recursive Fibonacci calculation simulation", () => {
    const source = `SUGOD
      MUGNA NUMERO memo1 = 1
      MUGNA NUMERO memo2 = 1
      MUGNA NUMERO memo3 = 2
      MUGNA NUMERO memo4 = 3
      MUGNA NUMERO memo5 = 5
      MUGNA NUMERO memo6 = 8
      MUGNA NUMERO memo7 = 13
      MUGNA NUMERO memo8 = 21
      
      MUGNA NUMERO n = 8
      MUGNA NUMERO result = 0
      
      -- Simulate recursion using lookup table
      KUNG (n == 0) PUNDOK {
        result = 0
      }
      KUNG DILI (n == 1 O n == 2) PUNDOK {
        result = 1
      }
      KUNG DILI (n == 3) PUNDOK {
        result = memo3
      }
      KUNG DILI (n == 4) PUNDOK {
        result = memo4
      }
      KUNG DILI (n == 5) PUNDOK {
        result = memo5
      }
      KUNG DILI (n == 6) PUNDOK {
        result = memo6
      }
      KUNG DILI (n == 7) PUNDOK {
        result = memo7
      }
      KUNG DILI (n == 8) PUNDOK {
        result = memo8
      }
      
      IPAKITA: result
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("21"); // 8th Fibonacci number is 21
  });

  test("Neural network forward pass simulation", () => {
    const source = `SUGOD
      -- Input values
      MUGNA TIPIK x1 = 0.5
      MUGNA TIPIK x2 = 0.3
      
      -- Hidden layer weights
      MUGNA TIPIK w1_11 = 0.2
      MUGNA TIPIK w1_12 = 0.4
      MUGNA TIPIK w1_21 = 0.3
      MUGNA TIPIK w1_22 = 0.1
      
      -- Hidden layer bias
      MUGNA TIPIK b1_1 = 0.1
      MUGNA TIPIK b1_2 = 0.2
      
      -- Output layer weights
      MUGNA TIPIK w2_11 = 0.3
      MUGNA TIPIK w2_12 = 0.5
      
      -- Output layer bias
      MUGNA TIPIK b2 = 0.1
      
      -- Forward pass calculation
      -- Hidden layer nodes
      MUGNA TIPIK h1 = x1 * w1_11 + x2 * w1_21 + b1_1
      MUGNA TIPIK h2 = x1 * w1_12 + x2 * w1_22 + b1_2
      
      -- ReLU activation function for hidden layer
      KUNG (h1 < 0) PUNDOK { h1 = 0 }
      KUNG (h2 < 0) PUNDOK { h2 = 0 }
      
      -- Output layer calculation
      MUGNA TIPIK output = h1 * w2_11 + h2 * w2_12 + b2
      
      -- Sigmoid activation approximation for output layer
      MUGNA TIPIK sigmoid = 0
      KUNG (output < -5) PUNDOK {
        sigmoid = 0
      }
      KUNG DILI (output > 5) PUNDOK {
        sigmoid = 1
      }
      KUNG WALA PUNDOK {
        -- Simple approximation of sigmoid using polynomial
        sigmoid = 0.5 + output * 0.25 - output * output * 0.01
      }
      
      IPAKITA: sigmoid
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    // Approximate result based on the neural network calculation with our simplified sigmoid
    expect(result).toBe("0.59888396");
  });

  test("Extended nested expressions with complex operator precedence", () => {
    const source = `SUGOD
      MUGNA NUMERO a = 5
      MUGNA NUMERO b = 3
      MUGNA NUMERO c = 7
      MUGNA NUMERO d = 2
      
      MUGNA TINUOD p = "OO"
      MUGNA TINUOD q = "DILI"
      MUGNA TINUOD r = "OO"
      
      MUGNA NUMERO result = ((a + b) * (c - d) % 5) * (a / b) + (c % d)
      MUGNA TINUOD logicResult = (p UG DILI q) O (DILI(p) UG r) O (DILI(p O q) UG DILI r)
      
      IPAKITA: result & " " & logicResult
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    // ((5+3)*(7-2)%5)*(5/3)+7%2 = (8*5%5)*(1)+1 = 0*1+1 = 1
    // (true AND NOT false) OR (NOT(true) AND true) OR (NOT(true OR false) AND NOT true)
    // = true OR false OR (NOT true AND false) = true OR false OR false = true
    expect(result).toBe("1 OO");
  });
});
