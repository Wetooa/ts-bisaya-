import { TokenType } from "../../consts/lexer/token-type";
import { type Token } from "../../types/lexer/token";
import type {
  Expression,
  Identifier,
  NumericLiteral,
  Program,
} from "../../types/parser";
import { ASTNodeTypes } from "./consts/ast-node-types";

export class Parser {
  private tokens: Token[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private get currentToken(): Token {
    return this.tokens[0] as Token;
  }

  private eat() {
    return this.tokens.shift();
  }

  private isEnd() {
    return this.currentToken.type === TokenType.EOF;
  }

  public parse(): Program {
    const program = { type: ASTNodeTypes.PROGRAM, body: [] } as Program;

    while (!this.isEnd()) {
      const statement = this.parseStatement();
      if (statement) {
        program.body.push(statement);
      }
    }

    return program;
  }

  private parseStatement(): Expression {
    return this.parseExpression();
  }

  private parseExpression(): Expression {
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): Expression {
    const token = this.currentToken;

    switch (token.type) {
      case TokenType.IDENTIFIER:
        return {
          type: ASTNodeTypes.IDENTIFIER,
          value: this.eat()!.value,
        } as Identifier;

      case TokenType.NUMBER:
        return {
          type: ASTNodeTypes.NUMERIC_LITERAL,
          value: parseFloat(this.eat()!.value),
        } as NumericLiteral;

      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  }
}

// Factory function for backward compatibility
export function parse(input: Token[]): Program {
  const parser = new Parser(input);
  return parser.parse();
}
