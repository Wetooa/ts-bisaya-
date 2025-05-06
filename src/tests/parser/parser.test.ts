import { describe, test } from "bun:test";
import { TokenType } from "../../consts/lexer/token-type";
import { parse } from "../../modules/parser";
import type { Token } from "../../types/lexer";

describe("Lexer", () => {
  test("tokens parsed properly", () => {
    const tokens: Token[] = [{ type: TokenType.NUMERIC_LITERAL, value: "18" }];

    const ast = parse(tokens);

    console.log("Parsed AST:", ast);
  });
});
