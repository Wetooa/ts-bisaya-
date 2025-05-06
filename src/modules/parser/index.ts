import { TokenType } from "../../consts/lexer/token-type";
import type { DataType } from "../../consts/parser/datatype";
import {
  DataTypeMismatchException,
  DatatypeNotFoundException,
  IdentifierNotFoundException,
  IdentifierRedeclarationException,
  InvalidCodeBlocksException,
  ParserException,
  UnexpectedTokenException,
} from "../../exceptions/parser";
import { type Token } from "../../types/lexer";
import type {
  AssignmentExpression,
  BinaryExpression,
  BooleanLiteral,
  CharLiteral,
  CodeBlock,
  Expression,
  ForLoop,
  Identifier,
  IfStatement,
  InputStatement,
  NullLiteral,
  NumericLiteral,
  OutputStatement,
  Program,
  Statement,
  StringLiteral,
  VariableDeclaration,
} from "../../types/parser";

export class Parser {
  private tokens: Token[] = [];
  private index = 0;
  private identifierDataTypes = new Map<string, DataType>();
  private isRepl;

  constructor(tokens: Token[], isRepl = false) {
    this.tokens = tokens;
    this.isRepl = isRepl;
  }

  private get currentToken(): Token {
    return this.tokens[this.index] as Token;
  }

  private isIdentifierPresent(indentifier: string) {
    return this.identifierDataTypes.has(indentifier);
  }

  private setIdentifierDataType(identifier: string, dataType: DataType) {
    this.identifierDataTypes.set(identifier, dataType);
  }

  private getIdentifierDataType(identifier: Token): DataType {
    const dataType = identifier.value;

    if (dataType === "LETRA") return "CHAR";
    if (dataType === "TINUOD") return "BOOLEAN";
    if (dataType === "TIPIK") return "FLOAT";
    if (dataType === "NUMERO") return "INT";

    throw new DatatypeNotFoundException(dataType);
  }

  private eat() {
    console.log(
      `Eating token: ${this.currentToken.type} - ${this.currentToken.value}`,
    );
    return this.tokens[this.index++] as Token;
  }

  private expectType(tokenType: TokenType, errorMsg = "Unexpected token type") {
    if (this.isEnd() || this.currentToken.type === tokenType) return this.eat();
    throw new UnexpectedTokenException(errorMsg);
  }

  private expectValue(tokenValue: string, errorMsg = "Unexpected token value") {
    if (this.isEnd() || this.currentToken.value === tokenValue)
      return this.eat();
    throw new UnexpectedTokenException(errorMsg);
  }

  private expectTypeAndValue(
    tokenType: TokenType,
    tokenValue: string,
    errorMsg = "Unexpected token",
  ) {
    if (
      this.isEnd() ||
      (this.currentToken.type === tokenType &&
        this.currentToken.value === tokenValue)
    ) {
      return this.eat();
    }
    throw new UnexpectedTokenException(errorMsg);
  }

  private isEnd() {
    return this.currentToken.type === "EOF";
  }

  public parse(): Program {
    const program = { type: "PROGRAM", body: [] } as Program;

    if (!this.isRepl) {
      this.expectType("START_BLOCK", "Expected SUGOD to start program");
    }

    while (!this.isEnd() && this.currentToken.type !== "END_BLOCK") {
      const statement = this.parseStatement();
      if (statement) {
        program.body.push(statement);
      }
    }

    if (!this.isRepl) {
      this.expectType("END_BLOCK", "Expected KATAPUSAN to end program");
    }

    return program;
  }

  private parseStatement(): Statement {
    switch (this.currentToken.type) {
      case "VARIABLE_DECLARATION":
        return this.parseVariableDeclaration();
      case "INPUT_STATEMENTS":
        return this.parseInputStatement();
      case "OUTPUT_STATEMENTS":
        return this.parseOutputStatement();
      case "CONDITIONAL_DECLARATION":
        return this.parseConditionalStatement();
      case "FOR_LOOP_DECLARATION":
        return this.parseForLoopStatement();
      default:
        return this.parseExpression();
    }
  }

  private parseCondition(): Expression {
    this.expectType("OPEN_PARENTHESIS", "Expected opening parenthesis");
    const condition = this.parseExpression();
    if (condition.dataType !== "BOOLEAN") {
      throw new DataTypeMismatchException(condition.dataType, "BOOLEAN");
    }
    this.expectType("CLOSE_PARENTHESIS", "Expected closing parenthesis");
    this.expectType("NEWLINE", "Expected newline after condition");
    return condition;
  }

  private parseCodeBlock(): CodeBlock {
    this.expectType(
      "CODE_BLOCK_DECLARATION",
      "Expected PUNDOK to start code block",
    );
    this.expectType("OPEN_CURLY_BRACE", "Expected opening curly brace");

    const codeBlock: CodeBlock = {
      type: "CODE_BLOCK",
      body: [],
    };

    while (!this.isEnd() && this.currentToken.type !== "CLOSE_CURLY_BRACE") {
      const statement = this.parseStatement();
      if (statement) {
        codeBlock.body.push(statement);
      }
    }

    this.expectType("CLOSE_CURLY_BRACE", "Expected closing curly brace");
    this.expectType("NEWLINE", "Expected newline after code block");
    return codeBlock;
  }

  private parseConditionalStatement(): Statement {
    this.expectType(
      "CONDITIONAL_DECLARATION",
      "Expected conditional declaration",
    );

    const condition = this.parseCondition();
    const body = this.parseCodeBlock();

    const ifStatement: IfStatement = {
      type: "IF_STATEMENT",
      condition,
      body,
      elseIf: [],
    };

    while (
      !this.isEnd() &&
      this.currentToken.type === "CONDITIONAL_DECLARATION"
    ) {
      this.eat();
      const currentToken = this.currentToken.type as TokenType;

      if (
        currentToken === "LOGICAL_OPERATOR" &&
        this.currentToken.value === "DILI"
      ) {
        this.eat();
        const condition = this.parseCondition();
        const body = this.parseCodeBlock();
        ifStatement.elseIf.push({
          condition,
          body,
        });
        continue;
      }

      if (currentToken === "ELSE_BLOCK_DECLARATION") {
        this.eat();
        this.expectType("NEWLINE", "Expected newline after DILI");
        ifStatement.else = this.parseCodeBlock();
        break;
      }
    }

    return ifStatement;
  }

  private parseForLoopStatement(): ForLoop {
    this.expectTypeAndValue(
      "FOR_LOOP_DECLARATION",
      "ALANG",
      "Expected For Loop ALANG",
    );
    this.expectTypeAndValue(
      "FOR_LOOP_DECLARATION",
      "SA",
      "Expected For Loop SA",
    );

    // Initialization
    this.expectType(
      "OPEN_PARENTHESIS",
      "Expected opening parenthesis for loop",
    );

    const identifier = this.expectType(
      "IDENTIFIER",
      "Expected identifier for loop variable",
    );

    this.expectType("ASSIGNMENT_OPERATOR", "Expected assignment operator");

    const startValue = this.parseExpression();

    if (startValue.dataType !== "INT" && startValue.dataType !== "FLOAT") {
      throw new DataTypeMismatchException(startValue.dataType, "numeric type");
    }

    this.expectType("COMMA", "Expected comma after start value");

    // Condition
    const condition = this.parseExpression();

    if (condition.dataType !== "BOOLEAN") {
      throw new DataTypeMismatchException(condition.dataType, "BOOLEAN");
    }

    this.expectType("COMMA", "Expected comma after condition");

    // Increment
    const increment = this.parseExpression();

    this.expectType("CLOSE_PARENTHESIS", "Expected closing parenthesis");
    this.expectType("NEWLINE", "Expected newline after for loop declaration");

    // Body
    const body = this.parseCodeBlock();

    return {
      type: "FOR_LOOP",
      identifier: identifier.value,
      startValue: startValue,
      condition: condition,
      increment: increment,
      body: body,
    };
  }

  private parseInputStatement(): InputStatement {
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

  private parseOutputStatement(): OutputStatement {
    this.expectType("OUTPUT_STATEMENTS", "Expected output statement");
    this.expectType("COLON", "Expected colon after output statement");

    const result: OutputStatement = {
      type: "OUTPUT_STATEMENT",
      variables: [],
    };

    while (true) {
      switch (this.currentToken.type) {
        case "STRING": {
          const stringLiteral = this.expectType("STRING", "Expected string");
          result.variables.push({
            type: "LITERAL",
            value: stringLiteral.value,
          });
          break;
        }

        case "ESCAPED_CHAR": {
          const charLiteral = this.expectType("ESCAPED_CHAR", "Expected char");
          result.variables.push({ type: "LITERAL", value: charLiteral.value });
          break;
        }

        case "CHAR_LITERAL": {
          const charLiteral = this.expectType("CHAR_LITERAL", "Expected char");
          result.variables.push({ type: "LITERAL", value: charLiteral.value });
          break;
        }

        case "BOOLEAN_LITERAL": {
          const booleanLiteral = this.expectType(
            "BOOLEAN_LITERAL",
            "Expected boolean literal",
          );
          result.variables.push({
            type: "LITERAL",
            value: booleanLiteral.value,
          });
          break;
        }

        case "CARRIAGE_RETURN": {
          const carriageReturn = this.expectType(
            "CARRIAGE_RETURN",
            "Expected carriage return",
          );
          result.variables.push({
            type: "LITERAL",
            value: carriageReturn.value,
          });
          continue;
        }

        case "IDENTIFIER": {
          const identifier = this.expectType(
            "IDENTIFIER",
            "Expected identifier",
          );
          result.variables.push({
            type: "IDENTIFIER",
            identifierName: identifier.value,
          });
          break;
        }
      }

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

  private parseVariableDeclaration(): VariableDeclaration {
    this.expectType("VARIABLE_DECLARATION", "Expected variable declaration");

    const dataType = this.expectType(
      "DATATYPE",
      "Expected datatype following MUGNA keyword",
    );

    const declarationDataType = this.getIdentifierDataType(dataType);

    const result: VariableDeclaration = {
      type: "VARIABLE_DECLARATION",
      dataType: declarationDataType,
      variables: [],
    };

    while (true) {
      const identifier = this.expectType("IDENTIFIER", "Expected identifier");

      if (this.isIdentifierPresent(identifier.value)) {
        throw new IdentifierRedeclarationException(identifier);
      }

      this.setIdentifierDataType(identifier.value, declarationDataType);
      let value = undefined;

      if (this.currentToken.type === "ASSIGNMENT_OPERATOR") {
        this.expectValue("=", "Expected equals assignment operator");
        value = this.parseExpression();

        if (value.dataType !== declarationDataType) {
          throw new DataTypeMismatchException(
            value.dataType,
            declarationDataType,
          );
        }
      }

      result.variables.push({
        identifier: identifier.value,
        value,
      });

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

  private assertExpressionDataTypeMatching(a: Expression, b: Expression) {
    if (
      a.dataType !== undefined &&
      b.dataType !== undefined &&
      a.dataType !== b.dataType
    ) {
      throw new DataTypeMismatchException(a.dataType, b.dataType);
    }
  }

  private assertExpressionPresent(left: Expression) {
    if (left.type === "IDENTIFIER") {
      const identifier = left as Identifier;
      if (!this.isIdentifierPresent(identifier.value)) {
        throw new IdentifierNotFoundException(left as Identifier);
      }
    }
  }

  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }

  private parseAssignmentExpression(): Expression {
    let left = this.parseLogicalExpression();

    // NOTE: IF IT'S AN IDENTIFIER, CHECK IF IT'S DECLARED
    this.assertExpressionPresent(left);

    // FIX: implement this lol
    // if (this.currentToken.type === "INCREMENT_OPERATOR") {
    //   this.eat();
    // }

    if (this.currentToken.type === "ASSIGNMENT_OPERATOR") {
      this.eat();
      const right = this.parseExpression();

      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "ASSIGNMENT_EXPRESSION",
        dataType: left.dataType === undefined ? right.dataType : left.dataType,
        assignee: left,
        value: right,
      } as AssignmentExpression;
    }

    return left;
  }

  private parseLogicalExpression(): Expression {
    let left = this.parseRelationalExpression();

    while (!this.isEnd() && this.currentToken.type === "LOGICAL_OPERATOR") {
      const operator = this.eat()!.value;
      const right = this.parseExpression();

      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "BINARY_EXPRESSION",
        dataType: "BOOLEAN",
        operator,
        left,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  private parseRelationalExpression(): Expression {
    let left = this.parseAdditiveExpression();

    while (!this.isEnd() && this.currentToken.type === "RELATIONAL_OPERATOR") {
      const operator = this.eat()!.value;
      const right = this.parseExpression();

      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "BINARY_EXPRESSION",
        dataType: "BOOLEAN",
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
      const right = this.parseExpression();

      this.assertExpressionDataTypeMatching(left, right);

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
      const right = this.parseExpression();

      this.assertExpressionDataTypeMatching(left, right);

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

    // NOTE: FOR UNARY
    if (
      token.type === "ARITHMETIC_OPERATOR" &&
      (token.value === "-" || token.value === "+")
    ) {
      this.eat();
      const right = this.parseExpression();
      const left = {
        type: "NUMERIC_LITERAL",
        value: 0,
        dataType: right.dataType,
      };

      this.assertExpressionDataTypeMatching(left as Expression, right);

      return {
        type: "BINARY_EXPRESSION",
        dataType: right.dataType,
        operator: token.value[0],
        left,
        right,
      } as BinaryExpression;
    }

    if (token.type === "LOGICAL_OPERATOR" && token.value === "DILI") {
      this.eat();
      const right = this.parseExpression();

      if (right.dataType !== "BOOLEAN") {
        throw new DataTypeMismatchException(right.dataType, "BOOLEAN");
      }

      const value = right.value as BooleanLiteral;

      return {
        type: "BOOLEAN_LITERAL",
        dataType: "BOOLEAN",
        value: !value,
      } as BooleanLiteral;
    }

    switch (token.type) {
      case "IDENTIFIER":
        if (!this.isIdentifierPresent(token.value)) {
          throw new IdentifierNotFoundException(token);
        }

        return {
          type: "IDENTIFIER",
          value: this.eat()!.value,
        } as Identifier;

      case "WHOLE_NUMERIC_LITERAL":
        return {
          type: "NUMERIC_LITERAL",
          value: parseInt(this.eat()!.value),
          dataType: "INT",
        } as NumericLiteral;

      case "DECIMAL_NUMERIC_LITERAL":
        return {
          type: "NUMERIC_LITERAL",
          value: parseFloat(this.eat()!.value),
          dataType: "FLOAT",
        } as NumericLiteral;

      case "BOOLEAN_LITERAL":
        return {
          type: "BOOLEAN_LITERAL",
          value: this.eat()!.value === "OO" ? true : false,
          dataType: "BOOLEAN",
        } as BooleanLiteral;

      case "CHAR_LITERAL":
        return {
          type: "CHAR_LITERAL",
          value: this.eat()!.value,
          dataType: "CHAR",
        } as CharLiteral;

      case "STRING":
        return {
          type: "STRING_LITERAL",
          value: this.eat()!.value,
          dataType: "STRING",
        } as StringLiteral;

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
export function parse(input: Token[], isRepl: boolean = false): Program {
  const parser = new Parser(input, isRepl);
  return parser.parse();
}
