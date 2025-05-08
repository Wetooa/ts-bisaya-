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
      const tokens = lexer.tokenize(input);
      console.log("Tokens:", tokens);

      const ast = parser.parse(tokens);
      console.log("AST:", ast);

      output = interpreter.interpret(ast);
      console.log("==== SUCCESS =====");
      console.log("Output:\n", output);
    } catch (error) {
      console.log("==== FAIL =====");
      throw new Error(`Error: ${error}`);
    }
  } else {
    try {
      const tokens = lexer.tokenize(input);
      const ast = parser.parse(tokens);
      output = interpreter.interpret(ast);

      console.log("==== SUCCESS =====");
      console.log("Output:\n", output);
    } catch (error) {
      console.log("==== FAIL =====");
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

run(input, false, true);
