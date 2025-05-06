import { TokenType } from "../../consts/lexer/token-type";
import { ParserException } from "../../exceptions/parser";
import { type Token } from "../../types/lexer";
import type {
  AssignmentExpression,
  BinaryExpression,
  BooleanLiteral,
  CharLiteral,
  Expression,
  Identifier,
  InputStatement,
  NullLiteral,
  NumericLiteral,
  OutputStatement,
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
    return this.currentToken.type === "EOF";
  }

  public parse(): Program {
    const program = { type: "PROGRAM", body: [] } as Program;

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
      case "VARIABLE_DECLARATION":
        return this.parseVariableDeclaration();
      case "INPUT_STATEMENTS":
        return this.parseInputStatement();
      case "OUTPUT_STATEMENTS":
        return this.parseOutputStatement();
      default:
        return this.parseExpression();
    }
  }

  private parseInputStatement(): Expression {
    this.expectType("INPUT_STATEMENTS", "Expected input statement");
    this.expectType("COLON", "Expected colon after input statement");

    const result: InputStatement = {
      type: "INPUT_STATEMENT",
      variables: [],
    };

    while (true) {
      const identifier = this.expectType("IDENTIFIER", "Expected identifier");
      result.variables.push(identifier.value);

      if (this.currentToken.type === "COMMA") {
        this.eat();
        continue;
      }

      if (this.currentToken.type === "NEWLINE") {
        this.eat();
        break;
      }

      throw new ParserException("Expected comma or newline after identifier");
    }

    return result;
  }

  private parseOutputStatement(): Expression {
    this.expectType("OUTPUT_STATEMENTS", "Expected output statement");
    this.expectType("COLON", "Expected colon after output statement");

    const result: OutputStatement = {
      type: "OUTPUT_STATEMENT",
      variables: [],
    };

    while (true) {
      const identifier = this.expectType("IDENTIFIER", "Expected identifier");

      result.variables.push(identifier.value);

      if (this.currentToken.type === "AMPERSAND") {
        this.eat();
        continue;
      }

      if (this.currentToken.type === "NEWLINE") {
        this.eat();
        break;
      }

      throw new ParserException(
        "Expected ampersand or newline after identifier",
      );
    }

    return result;
  }

  private parseVariableDeclaration(): Expression {
    this.expectType("VARIABLE_DECLARATION", "Expected variable declaration");

    const dataType = this.expectType(
      "DATATYPE",
      "Expected datatype following MUGNA keyword",
    );

    const result: VariableDeclaration = {
      type: "VARIABLE_DECLARATION",
      dataType: dataType.value,
      variables: [],
    };

    while (true) {
      const identifier = this.expectType("IDENTIFIER", "Expected identifier");

      if (this.currentToken.type === "ASSIGNMENT_OPERATOR") {
        this.expectValue("=", "Expected equals assignment operator");
        const value = this.parseExpression();

        if (value.type !== dataType.value) {
          throw new ParserException("Type mismatch in assignment");
        }

        result.variables.push({
          identifier: identifier.value,
          value,
        });
      } else {
        result.variables.push({ identifier: identifier.value });
      }

      if (this.currentToken.type === "COMMA") {
        this.eat();
        continue;
      }

      if (this.currentToken.type === "NEWLINE") {
        this.eat();
        break;
      }

      throw new ParserException("Expected comma or newline after identifier");
    }

    return result;
  }

  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }

  private parseAssignmentExpression(): Expression {
    let left = this.parseLogicalExpression();

    if (this.currentToken.type === "ASSIGNMENT_OPERATOR") {
      this.eat();
      const right = this.parseLogicalExpression();

      if (right.type !== left.type) {
        throw new ParserException("Type mismatch in assignment");
      }

      left = {
        type: "ASSIGNMENT_EXPRESSION",
        dataType: left.dataType,
        assignee: left,
        value: right,
      } as AssignmentExpression;
    }

    return left;
  }

  private parseLogicalExpression(): Expression {
    let left = this.parseAdditiveExpression();

    while (!this.isEnd() && this.currentToken.type === "LOGICAL_OPERATOR") {
      const operator = this.eat()!.value;
      const right = this.parseAdditiveExpression();

      left = {
        type: "BINARY_EXPRESSION",
        dataType: left.dataType,
        operator,
        left,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();

    while (
      !this.isEnd() &&
      this.currentToken.type === "ARITHMETIC_OPERATOR" &&
      (this.currentToken.value === "+" || this.currentToken.value === "-")
    ) {
      const operator = this.eat()!.value;
      const right = this.parseMultiplicativeExpression();

      left = {
        type: "BINARY_EXPRESSION",
        dataType: left.dataType,
        operator,
        left,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  private parseMultiplicativeExpression(): Expression {
    let left = this.parsePrimaryExpression();

    while (
      !this.isEnd() &&
      this.currentToken.type === "ARITHMETIC_OPERATOR" &&
      (this.currentToken.value === "*" ||
        this.currentToken.value === "/" ||
        this.currentToken.value === "%")
    ) {
      const operator = this.eat()!.value;
      const right = this.parsePrimaryExpression();

      left = {
        type: "BINARY_EXPRESSION",
        dataType: left.dataType,
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
      case "IDENTIFIER":
        return {
          type: "IDENTIFIER",
          value: this.eat()!.value,
          dataType: token.
        } as Identifier;

      case "WHOLE_NUMERIC_LITERAL":
        return {
          type: "NUMERIC_LITERAL",
          value: parseInt(this.eat()!.value),
        } as NumericLiteral;

      case "DECIMAL_NUMERIC_LITERAL":
        return {
          type: "NUMERIC_LITERAL",
          value: parseFloat(this.eat()!.value),
        } as NumericLiteral;

      case "BOOLEAN_LITERAL":
        return {
          type: "BOOLEAN_LITERAL",
          value: !!this.eat()!.value,
        } as BooleanLiteral;

      case "CHAR_LITERAL":
        return {
          type: "CHAR_LITERAL",
          value: this.eat()!.value,
        } as CharLiteral;

      case "OPEN_PARENTHESIS":
        this.eat();
        const expression = this.parseExpression();
        this.expectType("CLOSE_PARENTHESIS", "Expected closing parenthesis");
        return expression;

      case "NEWLINE":
        this.eat();
        return {} as NullLiteral;

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
