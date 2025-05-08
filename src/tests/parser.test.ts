import { describe, expect, test } from "bun:test";
import { Tokenizer } from "../modules/lexer/tokenizer";
import { Parser } from "../modules/parser/parser";

describe("Parser", () => {
  test("parse simple numeric literals", () => {
    const input = "17";
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "NUMERIC_LITERAL",
      value: 17,
      dataType: "INT",
    });
  });

  test("parse decimal numeric literals", () => {
    const input = "42.5";
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "NUMERIC_LITERAL",
      value: 42.5,
      dataType: "FLOAT",
    });
  });

  test("parse boolean literals", () => {
    const input = `"OO"`;
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "BOOLEAN_LITERAL",
      value: true,
      dataType: "BOOLEAN",
    });
  });

  test("parse char literals", () => {
    const input = "'a'";
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "CHAR_LITERAL",
      value: "a",
      dataType: "CHAR",
    });
  });

  test("parse string literals", () => {
    const input = '"Hello world"';
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "STRING_LITERAL",
      value: "Hello world",
      dataType: "STRING",
    });
  });

  test("parse simple binary expression", () => {
    const input = "3 + 4";
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "BINARY_EXPRESSION",
      operator: "+",
      dataType: "INT",
      left: {
        type: "NUMERIC_LITERAL",
        value: 3,
        dataType: "INT",
      },
      right: {
        type: "NUMERIC_LITERAL",
        value: 4,
        dataType: "INT",
      },
    });
  });

  test("parse complex arithmetic expression with precedence", () => {
    const input = "2 + 3 * 4";
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "BINARY_EXPRESSION",
      operator: "+",
      left: {
        type: "NUMERIC_LITERAL",
        value: 2,
        dataType: "INT",
      },
      right: {
        type: "BINARY_EXPRESSION",
        operator: "*",
        left: {
          type: "NUMERIC_LITERAL",
          value: 3,
          dataType: "INT",
        },
        right: {
          type: "NUMERIC_LITERAL",
          value: 4,
          dataType: "INT",
        },
      },
    });
  });

  test("parse parenthesized expressions", () => {
    const input = "(2 + 3) * 4";
    const tokens = new Tokenizer(input, true).tokenize();
    const parser = new Parser(tokens, true);
    const ast = parser.parse();

    expect(ast).toBeDefined();
    expect(ast.body[0]).toMatchObject({
      type: "BINARY_EXPRESSION",
      operator: "*",
      right: {
        type: "NUMERIC_LITERAL",
        value: 4,
        dataType: "INT",
      },
      left: {
        type: "BINARY_EXPRESSION",
        operator: "+",
        left: {
          type: "NUMERIC_LITERAL",
          value: 2,
          dataType: "INT",
        },
        right: {
          type: "NUMERIC_LITERAL",
          value: 3,
          dataType: "INT",
        },
      },
    });
  });

  describe("Variable Declarations and Assignments", () => {
    test("parse variable declaration", () => {
      const input = "MUGNA NUMERO x\n";
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast).toBeDefined();
      expect(ast.body[0]).toMatchObject({
        type: "VARIABLE_DECLARATION",
        dataType: "INT",
        variables: [
          {
            identifier: "x",
            value: undefined,
          },
        ],
      });
    });

    test("parse variable declaration with initialization", () => {
      const input = "MUGNA NUMERO x = 42\n";
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast).toBeDefined();
      expect(ast.body[0]).toMatchObject({
        type: "VARIABLE_DECLARATION",
        dataType: "INT",
        variables: [
          {
            identifier: "x",
            value: {
              type: "NUMERIC_LITERAL",
              value: 42,
              dataType: "INT",
            },
          },
        ],
      });
    });

    test("parse multiple variable declarations", () => {
      const input = "MUGNA NUMERO x = 1, y = 2, z = 3\n";
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast).toBeDefined();
      expect(ast.body[0]).toMatchObject({
        type: "VARIABLE_DECLARATION",
        dataType: "INT",
        variables: [
          {
            identifier: "x",
            value: { type: "NUMERIC_LITERAL", value: 1, dataType: "INT" },
          },
          {
            identifier: "y",
            value: { type: "NUMERIC_LITERAL", value: 2, dataType: "INT" },
          },
          {
            identifier: "z",
            value: { type: "NUMERIC_LITERAL", value: 3, dataType: "INT" },
          },
        ],
      });
    });

    test("parse assignment expression", () => {
      const input = `
MUGNA NUMERO x = 10
x = 20
`;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[1]).toMatchObject({
        type: "ASSIGNMENT_EXPRESSION",
        dataType: "INT",
        assignee: {
          type: "IDENTIFIER",
          value: "x",
          dataType: "INT",
        },
        value: {
          type: "NUMERIC_LITERAL",
          value: 20,
          dataType: "INT",
        },
      });
    });

    test("parse variable of different types", () => {
      const input = `
MUGNA TIPIK f = 3.14
MUGNA LETRA c = 'A'
MUGNA TINUOD b = "OO"
`;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[0]?.dataType).toBe("FLOAT");
      expect(ast.body[1]?.dataType).toBe("CHAR");
      expect(ast.body[2]?.dataType).toBe("BOOLEAN");
    });
  });

  describe("Input and Output Statements", () => {
    test("parse input statement", () => {
      const input = "DAWAT: x, y, z\n";
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[0]).toMatchObject({
        type: "INPUT_STATEMENT",
        variables: ["x", "y", "z"],
      });
    });

    test("parse output statement", () => {
      const input = `
MUGNA NUMERO x = 5, y, z
IPAKITA: x & y & z\n
`;

      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[0]).toMatchObject({
        type: "VARIABLE_DECLARATION",
        dataType: "INT",
        variables: [
          { identifier: "x", value: { type: "NUMERIC_LITERAL", value: 5 } },
          { identifier: "y" },
          { identifier: "z" },
        ],
      });

      expect(ast.body[1]).toMatchObject({
        type: "OUTPUT_STATEMENT",
        variables: [
          { type: "IDENTIFIER", value: "x" },
          { type: "IDENTIFIER", value: "y" },
          { type: "IDENTIFIER", value: "z" },
        ],
      });
    });

    test("parse output statement with expressions", () => {
      const input = `
MUGNA NUMERO x = 5
IPAKITA: x & x * 2 & "Result"
`;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[1]).toMatchObject({
        type: "OUTPUT_STATEMENT",
        variables: [
          { type: "IDENTIFIER", value: "x" },
          {
            type: "BINARY_EXPRESSION",
            operator: "*",
            left: { type: "IDENTIFIER", value: "x" },
            right: { type: "NUMERIC_LITERAL", value: 2 },
          },
          { type: "STRING_LITERAL", value: "Result" },
        ],
      });
    });
  });

  describe("Control Flow", () => {
    test("parse if statement", () => {
      const input = `
  MUGNA NUMERO x = 10
  KUNG (x > 5) PUNDOK {
    IPAKITA: "x is greater than 5"
  }
  `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[1]).toMatchObject({
        type: "IF_STATEMENT",
        condition: {
          type: "BINARY_EXPRESSION",
          operator: ">",
          dataType: "BOOLEAN",
          left: {
            type: "IDENTIFIER",
            value: "x",
          },
          right: {
            type: "NUMERIC_LITERAL",
            value: 5,
          },
        },
        body: {
          type: "CODE_BLOCK",
          body: [
            {
              type: "OUTPUT_STATEMENT",
              variables: [
                {
                  type: "STRING_LITERAL",
                  value: "x is greater than 5",
                },
              ],
            },
          ],
        },
        elseIf: [],
      });
    });

    test("parse if-else statement", () => {
      const input = `
    MUGNA NUMERO x = 3
    KUNG (x > 5) PUNDOK {
      IPAKITA: "x is greater than 5"
    }
    KUNG WALA PUNDOK {
      IPAKITA: "x is not greater than 5"
    }
    `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[1]).toMatchObject({
        type: "IF_STATEMENT",
        else: {
          type: "CODE_BLOCK",
          body: [
            {
              type: "OUTPUT_STATEMENT",
              variables: [
                {
                  type: "STRING_LITERAL",
                  value: "x is not greater than 5",
                },
              ],
            },
          ],
        },
      });
    });

    test("parse if-else if-else statement", () => {
      const input = `
    MUGNA NUMERO x = 3
    KUNG (x > 5) PUNDOK {
      IPAKITA: "x is greater than 5"
    }
    KUNG DILI (x < 0) PUNDOK {
      IPAKITA: "x is between 0 and 5"
    }
    KUNG WALA PUNDOK {
      IPAKITA: "x is negative"
    }
    `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[1]).toMatchObject({
        type: "IF_STATEMENT",
        elseIf: [
          {
            condition: {
              type: "BINARY_EXPRESSION",
              operator: "<",
              left: {
                type: "IDENTIFIER",
                value: "x",
              },
              right: {
                type: "NUMERIC_LITERAL",
                value: 0,
              },
            },
            body: {
              type: "CODE_BLOCK",
              body: [
                {
                  type: "OUTPUT_STATEMENT",
                  variables: [
                    {
                      type: "STRING_LITERAL",
                      value: "x is between 0 and 5",
                    },
                  ],
                },
              ],
            },
          },
        ],
        else: {
          type: "CODE_BLOCK",
        },
      });
    });

    test("parse for loop", () => {
      const input = `
    MUGNA NUMERO i = 0
    ALANG SA (i = 0, i < 10, i++)
    PUNDOK {
      IPAKITA: i
    }
    `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);
      const ast = parser.parse();

      expect(ast.body[1]).toMatchObject({
        type: "FOR_LOOP",
        identifier: "i",
        startValue: {
          type: "NUMERIC_LITERAL",
          value: 0,
        },
        condition: {
          type: "BINARY_EXPRESSION",
          operator: "<",
          left: {
            type: "IDENTIFIER",
            value: "i",
          },
          right: {
            type: "NUMERIC_LITERAL",
            value: 10,
          },
        },
        body: {
          type: "CODE_BLOCK",
          body: [
            {
              type: "OUTPUT_STATEMENT",
              variables: [
                {
                  type: "IDENTIFIER",
                  value: "i",
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe("Complete Program", () => {
    test("parse a full program with multiple statements", () => {
      const input = `
  SUGOD
    MUGNA NUMERO x = 10
    MUGNA NUMERO y = 20

    MUGNA NUMERO sum = x + y
    IPAKITA: "Sum is: " & sum

    KUNG (sum > 25) PUNDOK {
      IPAKITA: "Sum is greater than 25"
    }
    KUNG DILI (sum < 15) PUNDOK {
      IPAKITA: "Sum is between 15 and 25"
    }
    KUNG WALA PUNDOK {
      IPAKITA: "Sum is less than 15"
    }

    MUGNA NUMERO i = 0
    ALANG SA (i = 0, i < sum, i++)
    PUNDOK {
      IPAKITA: i
    }
  KATAPUSAN
  `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast).toBeDefined();
      expect(ast.type).toBe("PROGRAM");
      expect(ast.body.length).toBe(7);
    });

    test("parse a program with nested blocks", () => {
      const input = `
  SUGOD
    MUGNA NUMERO x = 10

    KUNG (x > 5) PUNDOK {
      MUGNA NUMERO y = x * 2

      KUNG (y > 15) PUNDOK {
        IPAKITA: "y is greater than 15"
      }

      MUGNA NUMERO i = 0
      ALANG SA (i = 0, i < y, i++)
      PUNDOK {
        IPAKITA: i
      }
    }
  KATAPUSAN
  `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast.body[1]?.body.body.length).toBe(4); // variable declaration, if statement, for loop
    });
  });

  describe("Error Handling", () => {
    test("should throw error on identifier not found", () => {
      const input = "x + 5"; // x is not declared
      const tokens = new Tokenizer(input, true).tokenize();
      const parser = new Parser(tokens, true);

      expect(() => parser.parse()).toThrow('Identifier "x" not found');
    });

    test("should throw error on datatype mismatch", () => {
      const input = `
    MUGNA NUMERO x = 10
    MUGNA LETRA c = 'A'
    x = c  
    `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);

      expect(() => parser.parse()).toThrow(
        'Expected type is "INT", got "CHAR"',
      );
    });

    test("should throw error on identifier redeclaration", () => {
      const input = `
    MUGNA NUMERO x = 10
    MUGNA TIPIK x = 3.14 
    `;
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);

      expect(() => parser.parse()).toThrow(
        'Identifier "x" has already been declared',
      );
    });

    test("should throw error on unexpected token", () => {
      const input = "MUGNA NUMERO x = "; // Missing expression after =
      const tokens = new Tokenizer(input).tokenize();
      const parser = new Parser(tokens, true);

      expect(() => parser.parse()).toThrow("Unexpected token");
    });
  });
});
