import { TokenType } from "../../consts/lexer/token-type";
import { ASTNodeType } from "../../consts/parser/ast-node-types";
import { ParserException } from "../../exceptions/parser";
import { type Token } from "../../types/lexer";
import type {
  CharLiteral,
  Expression,
  Identifier,
  NullLiteral,
  NumericLiteral,
  Program,
  VariableDeclaration,
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

  private expectType(tokenType: TokenType, errorMsg = "Unexpected token type") {
    if (this.isEnd() || this.currentToken.type === tokenType) return this.eat();
    throw new ParserException(errorMsg);
  }

  private expectValue(tokenValue: string, errorMsg = "Unexpected token value") {
    if (this.isEnd() || this.currentToken.value === tokenValue)
      return this.eat();
    throw new ParserException(errorMsg);
  }

  private isEnd() {
    return this.currentToken.type === TokenType.EOF;
  }

  public parse(): Program {
    const program = { type: ASTNodeType.PROGRAM, body: [] } as Program;

    while (!this.isEnd()) {
      const statement = this.parseStatement();
      if (statement) {
        program.body.push(statement);
      }
    }

    return program;
  }

  private parseStatement(): Expression {
    switch (this.currentToken.type) {
      case TokenType.VARIABLE_DECLARATION:
        return this.parseVariableDeclaration();
      default:
        return this.parseExpression();
    }
  }

  private parseVariableDeclaration(): Expression {
    this.expectType(
      TokenType.VARIABLE_DECLARATION,
      "Expected variable declaration",
    );

    const dataType = this.expectType(
      TokenType.DATATYPE,
      "Expected datatype following MUGNA keyword",
    );

    const result: VariableDeclaration = {
      type: "VARIABLE_DECLARATION",
      dataType: dataType.value,
      variables: [],
    };

    const DATATYPE_TO_AST_NODE_TYPE: Record<string, ASTNodeType> = {
        "CHAR_LITERAL": ASTNodeType.CHAR_LITERAL,
        "NUMERIC_LITERAL": ASTNodeType.NUMERIC_LITERAL,
        "BOOLEAN_LITERAL": ASTNodeType.BOOLEAN_LITERAL,
    }

    while (true) {
      const identifier = this.expectType(
        TokenType.IDENTIFIER,
        "Expected identifier",
      );

      if (this.currentToken.type === TokenType.ASSIGNMENT_OPERATOR) {
        this.expectValue("=", "Expected equals assignment operator");
        const value = this.parseExpression();

        if ()

        result.variables.push({
          identifier: identifier.value,
          value,
        });
      } else {
        result.variables.push({ identifier: identifier.value });
      }

      if (this.isEnd() || this.currentToken.type !== TokenType.COMMA) {
        break;
      }

      this.eat();
    }

    return result;
  }

  private parseExpression(): Expression {
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();

    while (
      !this.isEnd() &&
      this.currentToken.type === TokenType.ARITHMETIC_OPERATOR &&
      (this.currentToken.value === "+" || this.currentToken.value === "-")
    ) {
      const operator = this.eat()!.value;
      const right = this.parseMultiplicativeExpression();

      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
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
      (this.currentToken.value === "*" ||
        this.currentToken.value === "/" ||
        this.currentToken.value === "%")
    ) {
      const operator = this.eat()!.value;
      const right = this.parsePrimaryExpression();

      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
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
          type: ASTNodeType.IDENTIFIER,
          value: this.eat()!.value,
        } as Identifier;

      case TokenType.CHAR_LITERAL:
        return {
          type: ASTNodeType.CHAR_LITERAL,
          value: this.eat()!.value,
        } as CharLiteral;

      case TokenType.NULL:
        this.eat();
        return {
          type: ASTNodeType.NULL_LITERAL,
        } as NullLiteral;

      case TokenType.NUMERIC_LITERAL:
        return {
          type: ASTNodeType.NUMERIC_LITERAL,
          value: parseFloat(this.eat()!.value),
        } as NumericLiteral;

      case TokenType.OPEN_PARENTHESIS:
        this.eat();
        const expression = this.parseExpression();
        this.expectType(
          TokenType.OPEN_PARENTHESIS,
          "Expected closing parenthesis",
        );
        return expression;

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
