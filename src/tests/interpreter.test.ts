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

    expect(result).toBe("OO"); // 153 is an Armstrong number (1³ + 5³ + 3³ = 153)
  });

  test("Pascal's triangle row calculation", () => {
    const source = `SUGOD
      MUGNA NUMERO n = 5  -- Calculate the 5th row (0-indexed)
      MUGNA NUMERO prev = 1
      MUGNA NUMERO curr
      MUGNA NUMERO i = 0
      MUGNA NUMERO j = 0
      MUGNA STRING result = "1,"
      
      -- Calculate binomial coefficients for nth row
      ALANG SA (j = 1, j <= n, j++)
      PUNDOK {
        curr = (prev * (n - j + 1)) / j
        result = result & curr & ","
        prev = curr
      }
      
      IPAKITA: result
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("1,5,10,10,5,1,"); // 5th row of Pascal's triangle
  });

  test("Complex nested conditions", () => {
    const source = `SUGOD
      MUGNA NUMERO x = 7
      MUGNA NUMERO y = 3
      MUGNA NUMERO z = 10
      MUGNA STRING result = ""
      
      KUNG (x > 5) PUNDOK {
        KUNG (y < 5) PUNDOK {
          KUNG (z == 10) PUNDOK {
            result = "Path 1"
          }
          KUNG WALA PUNDOK {
            result = "Path 2"
          }
        }
        KUNG WALA PUNDOK {
          result = "Path 3"
        }
      }
      KUNG WALA PUNDOK {
        KUNG (y > 0) PUNDOK {
          result = "Path 4"
        }
        KUNG WALA PUNDOK {
          result = "Path 5"
        }
      }
      
      IPAKITA: result
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
      MUGNA STRING factors = ""
      
      ALANG SA (i <= n, i <= n, i = i)
      PUNDOK {
        KUNG (n % i == 0) PUNDOK {
          factors = factors & i & ","
          n = n / i
        }
        KUNG WALA PUNDOK {
          i = i + 1
        }
      }
      
      IPAKITA: factors
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
      
      ALANG SA (n != 1, n != 1, n = n)
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

  test("Caesar cipher encryption", () => {
    const source = `SUGOD
      MUGNA LETRA a = 'A'
      MUGNA LETRA b = 'B'
      MUGNA LETRA c = 'C'
      MUGNA NUMERO shift = 3
      MUGNA STRING result = ""
      MUGNA NUMERO code_a, code_b, code_c
      
      -- ASCII values
      code_a = 65 // 'A'
      
      -- Calculate ASCII values after shift
      code_a = ((code_a - 65 + shift) % 26) + 65
      code_b = ((66 - 65 + shift) % 26) + 65
      code_c = ((67 - 65 + shift) % 26) + 65
      
      -- Convert back to characters (this is a simplification)
      MUGNA LETRA shifted_a
      MUGNA LETRA shifted_b 
      MUGNA LETRA shifted_c
      
      KUNG (code_a == 68) PUNDOK {
        shifted_a = 'D'
      }
      KUNG (code_b == 69) PUNDOK {
        shifted_b = 'E'
      }
      KUNG (code_c == 70) PUNDOK {
        shifted_c = 'F'
      }
      
      result = result & shifted_a & shifted_b & shifted_c
      
      IPAKITA: result
    KATAPUSAN`;

    const tokens = new Tokenizer().tokenize(source);
    const ast = new Parser().parse(tokens);
    const result = interpreter.interpret(ast);

    expect(result).toBe("DEF"); // Caesar cipher of "ABC" with shift 3 is "DEF"
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
});
