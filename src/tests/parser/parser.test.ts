import { describe, test } from "bun:test";
import { tokenize } from "../../modules/lexer";
import { parse } from "../../modules/parser";

describe("Lexer", () => {
  test("tokens parsed properly", () => {
    const input = "17";

    const tokens = tokenize(input);
    const ast = parse(tokens);

    console.log("Parsed AST:", ast);
  });
});
