import { describe, expect, test } from "bun:test";
import {
  EmptyCharLiteralException,
  UnterminatedStringException,
} from "../exceptions/lexer.exceptions";
import { readTestCases } from "../utils/interpreter.utils";
import { Tokenizer } from "../modules/lexer/tokenizer";

const tokenize = (input: string) => {
  return new Tokenizer().tokenize(input);
};

describe("Lexer", () => {
  test("tokenizes basic expressions correctly", () => {
    const input =
      '123 MUGNA <= <> > 23\n what_ever NUMERO "OO" O O x, y, z, abc';
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("WHOLE_NUMERIC_LITERAL");
    expect(tokens[0]?.value).toBe("123");

    expect(tokens[1]?.type).toBe("VARIABLE_DECLARATION");
    expect(tokens[1]?.value).toBe("MUGNA");

    expect(tokens[2]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[2]?.value).toBe("<=");

    expect(tokens[3]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[3]?.value).toBe("<>");

    expect(tokens[4]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[4]?.value).toBe(">");

    expect(tokens[5]?.type).toBe("WHOLE_NUMERIC_LITERAL");
    expect(tokens[5]?.value).toBe("23");

    expect(tokens[6]?.type).toBe("NEWLINE");

    expect(tokens[7]?.type).toBe("IDENTIFIER");
    expect(tokens[7]?.value).toBe("what_ever");

    expect(tokens[8]?.type).toBe("DATATYPE");
    expect(tokens[8]?.value).toBe("NUMERO");

    expect(tokens[9]?.type).toBe("BOOLEAN_LITERAL");
    expect(tokens[9]?.value).toBe("OO");

    expect(tokens[10]?.type).toBe("LOGICAL_OPERATOR");
    expect(tokens[10]?.value).toBe("O");

    expect(tokens[11]?.type).toBe("LOGICAL_OPERATOR");
    expect(tokens[11]?.value).toBe("O");

    expect(tokens[12]?.type).toBe("IDENTIFIER");
    expect(tokens[12]?.value).toBe("x");

    expect(tokens[13]?.type).toBe("COMMA");
    expect(tokens[13]?.value).toBe(",");

    expect(tokens[14]?.type).toBe("IDENTIFIER");
    expect(tokens[14]?.value).toBe("y");

    expect(tokens[15]?.type).toBe("COMMA");
    expect(tokens[15]?.value).toBe(",");

    expect(tokens[16]?.type).toBe("IDENTIFIER");
    expect(tokens[16]?.value).toBe("z");

    expect(tokens[17]?.type).toBe("COMMA");
    expect(tokens[17]?.value).toBe(",");

    expect(tokens[18]?.type).toBe("IDENTIFIER");
    expect(tokens[18]?.value).toBe("abc");
  });

  test("tokenizes numeric literals correctly", () => {
    const input = "123 45.67 0 0.123 987.0";
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("WHOLE_NUMERIC_LITERAL");
    expect(tokens[0]?.value).toBe("123");

    expect(tokens[1]?.type).toBe("DECIMAL_NUMERIC_LITERAL");
    expect(tokens[1]?.value).toBe("45.67");

    expect(tokens[2]?.type).toBe("WHOLE_NUMERIC_LITERAL");
    expect(tokens[2]?.value).toBe("0");

    expect(tokens[3]?.type).toBe("DECIMAL_NUMERIC_LITERAL");
    expect(tokens[3]?.value).toBe("0.123");

    expect(tokens[4]?.type).toBe("DECIMAL_NUMERIC_LITERAL");
    expect(tokens[4]?.value).toBe("987.0");
  });

  test("tokenizes operators correctly", () => {
    const input = "+ - * / % ++ = == <= >= <> <";
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("ARITHMETIC_OPERATOR");
    expect(tokens[0]?.value).toBe("+");

    expect(tokens[1]?.type).toBe("ARITHMETIC_OPERATOR");
    expect(tokens[1]?.value).toBe("-");

    expect(tokens[2]?.type).toBe("ARITHMETIC_OPERATOR");
    expect(tokens[2]?.value).toBe("*");

    expect(tokens[3]?.type).toBe("ARITHMETIC_OPERATOR");
    expect(tokens[3]?.value).toBe("/");

    expect(tokens[4]?.type).toBe("ARITHMETIC_OPERATOR");
    expect(tokens[4]?.value).toBe("%");

    expect(tokens[5]?.type).toBe("INCREMENT_OPERATOR");
    expect(tokens[5]?.value).toBe("++");

    expect(tokens[6]?.type).toBe("ASSIGNMENT_OPERATOR");
    expect(tokens[6]?.value).toBe("=");

    expect(tokens[7]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[7]?.value).toBe("==");

    expect(tokens[8]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[8]?.value).toBe("<=");

    expect(tokens[9]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[9]?.value).toBe(">=");

    expect(tokens[10]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[10]?.value).toBe("<>");

    expect(tokens[11]?.type).toBe("RELATIONAL_OPERATOR");
    expect(tokens[11]?.value).toBe("<");
  });

  test("tokenizes string literals correctly", () => {
    const input = '"Hello, World!" "This is a test" "OO" "DILI"';
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("STRING");
    expect(tokens[0]?.value).toBe("Hello, World!");

    expect(tokens[1]?.type).toBe("STRING");
    expect(tokens[1]?.value).toBe("This is a test");

    expect(tokens[2]?.type).toBe("BOOLEAN_LITERAL");
    expect(tokens[2]?.value).toBe("OO");

    expect(tokens[3]?.type).toBe("BOOLEAN_LITERAL");
    expect(tokens[3]?.value).toBe("DILI");
  });

  test("tokenizes character literals correctly", () => {
    const input = "'a' 'b' 'c' '1' '$' ' '";
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("CHAR_LITERAL");
    expect(tokens[0]?.value).toBe("a");

    expect(tokens[1]?.type).toBe("CHAR_LITERAL");
    expect(tokens[1]?.value).toBe("b");

    expect(tokens[2]?.type).toBe("CHAR_LITERAL");
    expect(tokens[2]?.value).toBe("c");

    expect(tokens[3]?.type).toBe("CHAR_LITERAL");
    expect(tokens[3]?.value).toBe("1");

    expect(tokens[4]?.type).toBe("CHAR_LITERAL");
    expect(tokens[4]?.value).toBe("$");

    expect(tokens[5]?.type).toBe("CHAR_LITERAL");
    expect(tokens[5]?.value).toBe(" ");
  });

  test("tokenizes keywords correctly", () => {
    const input =
      "SUGOD KATAPUSAN KUNG WALA ALANG SA PUNDOK NUMERO TIPIK LETRA TINUOD SULAOD LETRA IPAGAWAS";
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("START_BLOCK");
    expect(tokens[0]?.value).toBe("SUGOD");

    expect(tokens[1]?.type).toBe("END_BLOCK");
    expect(tokens[1]?.value).toBe("KATAPUSAN");

    expect(tokens[2]?.type).toBe("CONDITIONAL_DECLARATION");
    expect(tokens[2]?.value).toBe("KUNG");

    expect(tokens[3]?.type).toBe("ELSE_BLOCK_DECLARATION");
    expect(tokens[3]?.value).toBe("WALA");

    expect(tokens[4]?.type).toBe("FOR_LOOP_DECLARATION");
    expect(tokens[4]?.value).toBe("ALANG");

    expect(tokens[5]?.type).toBe("FOR_LOOP_DECLARATION");
    expect(tokens[5]?.value).toBe("SA");

    expect(tokens[6]?.type).toBe("CODE_BLOCK_DECLARATION");
    expect(tokens[6]?.value).toBe("PUNDOK");

    expect(tokens[7]?.type).toBe("DATATYPE");
    expect(tokens[7]?.value).toBe("NUMERO");

    expect(tokens[8]?.type).toBe("DATATYPE");
    expect(tokens[8]?.value).toBe("TIPIK");

    expect(tokens[9]?.type).toBe("DATATYPE");
    expect(tokens[9]?.value).toBe("LETRA");

    expect(tokens[10]?.type).toBe("DATATYPE");
    expect(tokens[10]?.value).toBe("TINUOD");
  });

  test("tokenizes comments correctly", () => {
    const input = "-- This is a comment\n123 -- Another comment\nword";
    const tokens = tokenize(input);

    // Comment should be skipped
    expect(tokens[0]?.type).toBe("NEWLINE");
    expect(tokens[1]?.type).toBe("WHOLE_NUMERIC_LITERAL");
    expect(tokens[1]?.value).toBe("123");

    // Second comment should be skipped
    expect(tokens[2]?.type).toBe("NEWLINE");
    expect(tokens[3]?.type).toBe("IDENTIFIER");
    expect(tokens[3]?.value).toBe("word");
  });

  test("tokenizes symbols correctly", () => {
    const input = "( ) { } , : & $";
    const tokens = tokenize(input);

    expect(tokens[0]?.type).toBe("OPEN_PARENTHESIS");
    expect(tokens[0]?.value).toBe("(");

    expect(tokens[1]?.type).toBe("CLOSE_PARENTHESIS");
    expect(tokens[1]?.value).toBe(")");

    expect(tokens[2]?.type).toBe("OPEN_CURLY_BRACE");
    expect(tokens[2]?.value).toBe("{");

    expect(tokens[3]?.type).toBe("CLOSE_CURLY_BRACE");
    expect(tokens[3]?.value).toBe("}");

    expect(tokens[4]?.type).toBe("COMMA");
    expect(tokens[4]?.value).toBe(",");

    expect(tokens[5]?.type).toBe("COLON");
    expect(tokens[5]?.value).toBe(":");

    expect(tokens[6]?.type).toBe("AMPERSAND");
    expect(tokens[6]?.value).toBe("&");

    expect(tokens[7]?.type).toBe("CARRIAGE_RETURN");
    expect(tokens[7]?.value).toBe("\n");
  });

  test("handles unterminated strings", () => {
    const input = '"This string is not terminated';

    expect(() => {
      tokenize(input);
    }).toThrow(UnterminatedStringException);
  });

  test("handles empty character literals", () => {
    const input = "''";

    expect(() => {
      tokenize(input);
    }).toThrow(EmptyCharLiteralException);
  });

  test("tokenizes test cases from files", () => {
    // Get test cases using the existing readTestCases utility
    const testcases = readTestCases();

    // Make sure we found some test cases
    expect(testcases.length).toBeGreaterThan(0);

    for (const testcase of testcases) {
      const tokens = tokenize(testcase.input);

      // Ensure we got tokens
      expect(tokens.length).toBeGreaterThan(0);

      // Ensure the last token is always EOF
      expect(tokens[tokens.length - 1]?.type).toBe("EOF");
    }
  });
});
