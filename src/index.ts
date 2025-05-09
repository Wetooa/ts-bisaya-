import { Interpreter } from "./modules/interpreter/interpreter";
import { Tokenizer } from "./modules/lexer/tokenizer";
import { Parser } from "./modules/parser/parser";

export function run(input: string, isRepl = false, isDebug = false) {
  if (isDebug) {
    console.log("Debug mode is enabled.");
    console.log(`You entered: ${input}`);
  }

  const lexer = new Tokenizer(isRepl);
  const parser = new Parser(isRepl);
  const interpreter = new Interpreter();

  let output = "";

  if (isDebug) {
    try {
      const startTime = performance.now();
      const tokens = lexer.tokenize(input);
      console.log("Tokens:", tokens);

      const ast = parser.parse(tokens);
      console.log("AST:", ast);

      output = interpreter.interpret(ast);
      const endTime = performance.now();

      const executionTime = (endTime - startTime).toFixed(2);
      console.log("\n✅ SUCCESS");
      console.log(`⏱️  Execution time: ${executionTime}ms`);
    } catch (error) {
      console.log("\n❌ FAIL");
      console.log(`🔴 Error: ${error}`);
    }
  } else {
    try {
      const startTime = performance.now();
      const tokens = lexer.tokenize(input);
      const ast = parser.parse(tokens);
      output = interpreter.interpret(ast);

      console.log("Output:\n", output);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      console.log("\n✅ SUCCESS");
      console.log(`⏱️  Execution time: ${executionTime}ms`);
    } catch (error) {
      console.log("\n❌ FAIL");
      console.log(`🔴 Error: ${error}`);
    }
  }

  return output;
}

let input = "";

input = `
SUGOD 
  MUGNA NUMERO x = 1
  IPAKITA: x
  MUGNA TINUOD y = "OO"
  IPAKITA: x & y & "HELLO"
  MUGNA NUMERO z = 2
  x = x + z * (5 - 1)
  -- DAWAT: x
  IPAKITA: x
  IPAKITA: $

  MUGNA NUMERO i, j
  MUGNA LETRA c = 'A'
  ALANG SA (i = 1, i <= 5, i++)
  PUNDOK {
    ALANG SA (j = 0, j < i, j++)
    PUNDOK {
      IPAKITA: c & ' '
    }
    IPAKITA: $
  }

  IPAKITA: x

  KUNG (x > 5) PUNDOK {
    IPAKITA: "Greater than 5"
  }

KATAPUSAN
`;

input = `
SUGOD
      MUGNA TINUOD p = "DILI"
      MUGNA TINUOD q = "DILI"
      MUGNA TINUOD result1
      MUGNA TINUOD result2
      
      -- ¬(p ∧ q) ≡ ¬p ∨ ¬q
      result1 = DILI(p UG q)
      result2 = (DILI p) O (DILI q)

      IPAKITA: result1 & " " & result2
KATAPUSAN

`;

input = `
SUGOD
      MUGNA NUMERO a = -5
      MUGNA NUMERO b = +3
      IPAKITA: -a + b
KATAPUSAN
`;

input = `
SUGOD
      MUGNA TINUOD a = "OO"
      MUGNA TINUOD b = "DILI"
      IPAKITA: DILI(a) == b
    KATAPUSAN
`;

input = `
SUGOD
      MUGNA TINUOD a = "OO" 
      MUGNA TINUOD b = "DILI"
      IPAKITA: DILI(DILI(a) UG DILI(b))
    KATAPUSAN
`;

input = `
SUGOD
      MUGNA NUMERO x = 5
      MUGNA NUMERO y = 3
      IPAKITA: x * (y * y)
    KATAPUSAN

`;

input = `
SUGOD
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
    KATAPUSAN
KATAPUSAN
`;

input = `
SUGOD
  MUGNA NUMERO x
  MUGNA TIPIK y
  DAWAT: x, y
KATAPUSAN
`;

input = `
SUGOD
  MUGNA NUMERO x = 30, y = 8, z
  DAWAT: z
  IPAKITA: x - y / z
KATAPUSAN
`;

run(input, false, false);
