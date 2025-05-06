import { describe, expect, test } from "bun:test";
import { TokenType } from "../../consts/lexer/token-type";
import { tokenize } from "../../modules/lexer";
import type { Token } from "../../types/lexer/token";
import { parse } from "../../modules/parser";

describe("Lexer", () => {
  test("tokens parsed properly", () => {
    const tokens: Token[] = [{ type: TokenType.NUMBER, value: "18" }];

    const ast = parse(tokens);

    console.log("Parsed AST:", ast);
  });
});
