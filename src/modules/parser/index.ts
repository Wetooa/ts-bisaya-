import { TokenType } from "../../consts/lexer/token-type";
import { ASTNodeTypes } from "../../consts/parser/ast-node-types";
import { type Token } from "../../types/lexer";
import type {
  Expression,
  Identifier,
  NumericLiteral,
  Program,
} from "../../types/parser";

export class Parser {
  private tokens: Token[] = [];
  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private get currentToken(): Token {
    return this.tokens[this.index] as Token;
  }

  private eat() {
    return this.tokens[this.index++] as Token;
  }

  private isEnd() {
    return this.tokens[this.index] === undefined;
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

  private parseAdditiveExpression(): Expression {
    let left = this.parsePrimaryExpression();

    while (
      !this.isEnd() &&
      this.currentToken.type === TokenType.ARITHMETIC_OPERATOR &&
      this.currentToken.value === "+"
    ) {
      const operator = this.eat()!.value;
      const right = this.parsePrimaryExpression();

      left = {
        type: ASTNodeTypes.BINARY_EXPRESSION,
        operator,
        left,
        right,
      } as Expression;
    }

    return left;
  }

  private parseMultiplicativeExpression(): Expression {
    let left = this.parsePrimaryExpression();

    while (
      !this.isEnd() &&
      this.currentToken.type === TokenType.ARITHMETIC_OPERATOR &&
      (this.currentToken.value === "*" || this.currentToken.value === "/")
    ) {
      const operator = this.eat()!.value;
      const right = this.parsePrimaryExpression();

      left = {
        type: ASTNodeTypes.BINARY_EXPRESSION,
        operator,
        left,
        right,
      } as Expression;
    }

    return left;
  }

  private parsePrimaryExpression(): Expression {
    const token = this.currentToken;

    switch (token.type) {
      case TokenType.IDENTIFIER:
        return {
          type: ASTNodeTypes.IDENTIFIER,
          value: this.eat()!.value,
        } as Identifier;

      case TokenType.NUMERIC_LITERAL:
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
