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

run(input, false, false);
