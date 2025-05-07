import { describe, expect, test } from "bun:test";
import { tokenize } from "../../modules/lexer";
import { parse } from "../../modules/parser";
import { interpret } from "../../modules/interpreter";

describe("Increment and Decrement Operators", () => {
  test("postfix increment (a++)", () => {
    const input = `
SUGOD
  MUGNA NUMERO a = 5
  a++
  IPAKITA: a
KATAPUSAN
`;
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = interpret(ast);

    expect(result).toBe("6");
  });

  test("prefix increment (++a)", () => {
    const input = `
SUGOD
  MUGNA NUMERO a = 5
  ++a
  IPAKITA: a
KATAPUSAN
`;
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = interpret(ast);

    expect(result).toBe("6");
  });

  test("postfix decrement (a--)", () => {
    const input = `
SUGOD
  MUGNA NUMERO a = 5
  a--
  IPAKITA: a
KATAPUSAN
`;
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = interpret(ast);

    expect(result).toBe("4");
  });

  test("prefix decrement (--a)", () => {
    const input = `
SUGOD
  MUGNA NUMERO a = 5
  --a
  IPAKITA: a
KATAPUSAN
`;
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = interpret(ast);

    expect(result).toBe("4");
  });

  test("increment in for loop", () => {
    const input = `
SUGOD
  MUGNA NUMERO ctr
  ALANG SA (ctr=1, ctr<=3, ctr++)
  PUNDOK{
    IPAKITA: ctr
  }
KATAPUSAN
`;
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = interpret(ast);

    expect(result).toBe("123");
  });
});
