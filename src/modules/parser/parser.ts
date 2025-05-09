import {
  DataTypeMismatchException,
  DatatypeNotFoundException,
  IdentifierNotFoundException,
  IdentifierRedeclarationException,
  ParserException,
  UnexpectedTokenException,
} from "../../exceptions/parser.exceptions";
import type { Token, TokenType } from "../../types/lexer.types";
import type {
  AssignmentExpression,
  BinaryExpression,
  BooleanLiteral,
  CharLiteral,
  CodeBlock,
  DataType,
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
} from "../../types/parser.types";
import { TokenReader } from "./token-reader";

export class Parser {
  private identifierDataTypes = new Map<string, DataType>();
  private reader: TokenReader;
  private isRepl;

  constructor(isRepl = false) {
    this.reader = new TokenReader([]);
    this.isRepl = isRepl;
  }

  private get currentToken(): Token {
    return this.reader.getCurrentToken();
  }

  private isIdentifierPresent(indentifier: string) {
    return this.identifierDataTypes.has(indentifier);
  }

  private setIdentifierDataType(identifier: string, dataType: DataType) {
    this.identifierDataTypes.set(identifier, dataType);
  }

  private getDataType(identifier: Expression): DataType {
    if (identifier.type !== "IDENTIFIER") {
      return identifier.dataType as DataType;
    }

    const dataType = this.identifierDataTypes.get(identifier.value as string);

    if (dataType === undefined) {
      throw new IdentifierNotFoundException(
        identifier.value as string,
        this.reader.getCurrentPosition(),
      );
    }
    return dataType;
  }

  private assertExpressionDataTypeMatching(a: Expression, b: Expression) {
    const x = this.getDataType(a);
    const y = this.getDataType(b);

    if (
      (x === "NUMERO" || x === "TIPIK") &&
      (y === "NUMERO" || y === "TIPIK")
    ) {
      return;
    }

    if (x !== y) {
      throw new DataTypeMismatchException(
        x,
        y,
        this.reader.getCurrentPosition(),
      );
    }
  }

  private assertExpressionPresent(left: Expression) {
    if (left.type === "IDENTIFIER") {
      const identifier = left as Identifier;
      if (!this.isIdentifierPresent(identifier.value)) {
        throw new IdentifierNotFoundException(
          left.value as string,
          this.reader.getCurrentPosition(),
        );
      }
    }
  }

  private assertIdentifierNotRedeclared(identifier: string) {
    if (this.isIdentifierPresent(identifier)) {
      throw new IdentifierRedeclarationException(
        identifier,
        this.reader.getCurrentPosition(),
      );
    }
  }

  private removeSkippableTokens() {
    let x = false;
    while (
      !this.reader.isEnd() &&
      (this.currentToken.type === "NEWLINE" ||
        this.currentToken.type === "NULL")
    ) {
      x = true;
      this.reader.eat();
    }
    return x;
  }

  public parse(tokens: Token[]): Program {
    this.reader = new TokenReader(tokens);

    const program = { type: "PROGRAM", body: [] } as Program;

    if (!this.isRepl) {
      this.removeSkippableTokens();
      this.reader.expectType("START_BLOCK", "Expected SUGOD to start program");
    }

    while (!this.reader.isEnd() && this.currentToken.type !== "END_BLOCK") {
      const statement = this.parseStatement();
      // Only add non-empty objects to the program body
      if (statement && Object.keys(statement).length > 0) {
        program.body.push(statement);
      }
    }

    if (!this.isRepl) {
      this.reader.expectType("END_BLOCK", "Expected KATAPUSAN to end program");
      this.removeSkippableTokens();

      if (!this.reader.isEnd()) {
        throw new ParserException("Must end with KATAPUSAN");
      }
    }

    return program;
  }

  private parseStatement(): Statement {
    let res;

    switch (this.currentToken.type) {
      case "VARIABLE_DECLARATION":
        res = this.parseVariableDeclaration();
        break;
      case "INPUT_STATEMENTS":
        res = this.parseInputStatement();
        break;
      case "OUTPUT_STATEMENTS":
        res = this.parseOutputStatement();
        break;
      case "CONDITIONAL_DECLARATION":
        res = this.parseConditionalStatement();
        break;
      case "FOR_LOOP_DECLARATION":
        res = this.parseForLoopStatement();
        break;
      default:
        res = this.parseExpression();
        break;
    }

    return res;
  }

  private parseCondition(): Expression {
    this.reader.expectType("OPEN_PARENTHESIS", "Expected opening parenthesis");
    const condition = this.parseExpression();
    const dataType = this.getDataType(condition);

    if (condition.dataType !== "TINUOD") {
      throw new DataTypeMismatchException(
        "BOOLEAN",
        dataType,
        this.reader.getCurrentPosition(),
      );
    }
    this.reader.expectType("CLOSE_PARENTHESIS", "Expected closing parenthesis");
    this.removeSkippableTokens();
    return condition;
  }

  private parseCodeBlock(): CodeBlock {
    this.reader.expectType(
      "CODE_BLOCK_DECLARATION",
      "Expected PUNDOK to start code block",
    );
    this.reader.expectType("OPEN_CURLY_BRACE", "Expected opening curly brace");

    const codeBlock: CodeBlock = {
      type: "CODE_BLOCK",
      body: [],
    };

    while (
      !this.reader.isEnd() &&
      this.currentToken.type !== "CLOSE_CURLY_BRACE"
    ) {
      const statement = this.parseStatement();
      // Only add non-empty objects to the code block body
      if (statement && Object.keys(statement).length > 0) {
        codeBlock.body.push(statement);
      }
    }

    this.reader.expectType("CLOSE_CURLY_BRACE", "Expected closing curly brace");
    return codeBlock;
  }

  private parseConditionalStatement(): Statement {
    this.reader.expectType(
      "CONDITIONAL_DECLARATION",
      "Expected conditional declaration",
    );

    let lastSpace = false;

    const condition = this.parseCondition();
    const body = this.parseCodeBlock();
    lastSpace = this.removeSkippableTokens();

    const ifStatement: IfStatement = {
      type: "IF_STATEMENT",
      condition,
      body,
      elseIf: [],
    };

    while (
      !this.reader.isEnd() &&
      this.currentToken.type === "CONDITIONAL_DECLARATION" &&
      this.reader.peek(1) !== undefined &&
      ((this.reader.peek(1)!.type === "LOGICAL_OPERATOR" &&
        this.reader.peek(1)!.value === "DILI") ||
        this.reader.peek(1)!.type === "ELSE_BLOCK_DECLARATION")
    ) {
      this.reader.eat();
      const currentToken = this.currentToken.type as TokenType;

      if (
        currentToken === "LOGICAL_OPERATOR" &&
        this.currentToken.value === "DILI"
      ) {
        this.reader.eat();
        this.removeSkippableTokens();
        const condition = this.parseCondition();
        const body = this.parseCodeBlock();
        lastSpace = this.removeSkippableTokens();
        ifStatement.elseIf.push({
          condition,
          body,
        });
        continue;
      }

      if (currentToken === "ELSE_BLOCK_DECLARATION") {
        this.reader.eat();
        this.removeSkippableTokens();
        ifStatement.else = this.parseCodeBlock();
        lastSpace = this.removeSkippableTokens();
        break;
      }
    }

    if (!lastSpace) {
      throw new ParserException(
        "Expected newline after if statement",
        this.reader.getCurrentPosition(),
      );
    }

    return ifStatement;
  }

  private parseForLoopStatement(): ForLoop {
    this.reader.expectTypeAndValue(
      "FOR_LOOP_DECLARATION",
      "ALANG",
      "Expected For Loop ALANG",
    );
    this.reader.expectTypeAndValue(
      "FOR_LOOP_DECLARATION",
      "SA",
      "Expected For Loop SA",
    );

    // Initialization
    this.reader.expectType(
      "OPEN_PARENTHESIS",
      "Expected opening parenthesis for loop",
    );

    const start = this.parseExpression();
    this.reader.expectType("COMMA", "Expected comma after start value");
    const condition = this.parseExpression();
    this.reader.expectType("COMMA", "Expected comma after condition");
    const increment = this.parseExpression();
    this.reader.expectType("CLOSE_PARENTHESIS", "Expected closing parenthesis");
    this.removeSkippableTokens();

    // Body
    const body = this.parseCodeBlock();

    this.reader.expectType("NEWLINE", "Expected newline after if statement");
    return {
      type: "FOR_LOOP",
      startExpression: start,
      condition: condition,
      increment: increment,
      body: body,
    };
  }

  private parseInputStatement(): InputStatement {
    this.reader.expectType("INPUT_STATEMENTS", "Expected input statement");
    this.reader.expectType("COLON", "Expected colon after input statement");

    const result: InputStatement = {
      type: "INPUT_STATEMENT",
      variables: [],
    };

    while (true) {
      const identifier = this.reader.expectType(
        "IDENTIFIER",
        "Expected identifier",
      );
      result.variables.push(identifier.value);

      if (this.currentToken.type === "COMMA") {
        this.reader.eat();
        continue;
      }

      if (this.currentToken.type === "NEWLINE") {
        this.reader.eat();
        break;
      }

      throw new ParserException(
        "Expected comma or newline after identifier",
        this.reader.getCurrentPosition(),
      );
    }

    return result;
  }

  private parseOutputStatement(): OutputStatement {
    this.reader.expectType("OUTPUT_STATEMENTS", "Expected output statement");
    this.reader.expectType("COLON", "Expected colon after output statement");

    const result: OutputStatement = {
      type: "OUTPUT_STATEMENT",
      variables: [],
    };

    while (true) {
      result.variables.push(this.parseExpression());

      if (this.currentToken.type === "AMPERSAND") {
        this.reader.eat();
        continue;
      }

      if (this.currentToken.type === "NEWLINE") {
        this.reader.eat();
        break;
      }

      throw new ParserException(
        "Expected ampersand or newline after identifier",
        this.reader.getCurrentPosition(),
      );
    }

    return result;
  }

  private parseVariableDeclaration(): VariableDeclaration {
    this.reader.expectType(
      "VARIABLE_DECLARATION",
      "Expected variable declaration",
    );

    const dataType = this.reader.expectType(
      "DATATYPE",
      "Expected datatype following MUGNA keyword",
    );

    const declarationDataType = dataType.value as DataType;

    const result: VariableDeclaration = {
      type: "VARIABLE_DECLARATION",
      dataType: declarationDataType,
      variables: [],
    };

    while (true) {
      const identifier = this.reader.expectType(
        "IDENTIFIER",
        "Expected identifier",
      );

      this.assertIdentifierNotRedeclared(identifier.value);

      let value = undefined;

      if (this.currentToken.type === "ASSIGNMENT_OPERATOR") {
        this.reader.expectValue("=", "Expected equals assignment operator");
        value = this.parseExpression();
        this.assertExpressionDataTypeMatching(value, result as Expression);
      }

      this.setIdentifierDataType(identifier.value, declarationDataType);

      result.variables.push({
        identifier: identifier.value,
        value,
      });

      if (this.currentToken.type === "COMMA") {
        this.reader.eat();
        continue;
      }

      if (this.currentToken.type === "NEWLINE") {
        this.reader.eat();
        break;
      }

      throw new ParserException(
        "Expected comma or newline after identifier",
        this.reader.getCurrentPosition(),
      );
    }

    return result;
  }

  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }

  private parseAssignmentExpression(): Expression {
    let left = this.parseLogicalExpression();

    // NOTE: IF IT'S AN IDENTIFIER, CHECK IF IT'S DECLARED
    this.assertExpressionPresent(left);

    if (this.currentToken.type === "INCREMENT_OPERATOR") {
      const op = this.reader.eat();

      this.assertExpressionDataTypeMatching(left, {
        dataType: "NUMERO",
      } as NumericLiteral);

      const right = {
        type: "BINARY_EXPRESSION",
        dataType: "NUMERO",
        operator: op.value[0],
        left: {
          type: "IDENTIFIER",
          value: left.value,
        } as Identifier,
        right: this.createLiteral("NUMERO", 1),
      } as BinaryExpression;

      this.assertExpressionDataTypeMatching(left, right);

      return {
        type: "ASSIGNMENT_EXPRESSION",
        dataType: left.dataType === undefined ? right.dataType : left.dataType,
        assignee: left,
        value: right,
      } as AssignmentExpression;
    }

    if (this.currentToken.type === "ASSIGNMENT_OPERATOR") {
      this.reader.eat();
      const right = this.parseLogicalExpression();

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

    while (
      !this.reader.isEnd() &&
      this.currentToken.type === "LOGICAL_OPERATOR"
    ) {
      const operator = this.reader.eat()!.value;
      const right = this.parseRelationalExpression();

      this.assertExpressionDataTypeMatching(
        this.createLiteral("TINUOD", true),
        left,
      );
      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "BINARY_EXPRESSION",
        dataType: "TINUOD",
        operator,
        left,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  private parseRelationalExpression(): Expression {
    let left = this.parseAdditiveExpression();

    while (
      !this.reader.isEnd() &&
      this.currentToken.type === "RELATIONAL_OPERATOR"
    ) {
      const operator = this.reader.eat()!.value;
      const right = this.parseAdditiveExpression();

      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "BINARY_EXPRESSION",
        dataType: "TINUOD",
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
      !this.reader.isEnd() &&
      this.currentToken.type === "ARITHMETIC_OPERATOR" &&
      (this.currentToken.value === "+" || this.currentToken.value === "-")
    ) {
      const operator = this.reader.eat()!.value;
      const right = this.parseMultiplicativeExpression();

      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "BINARY_EXPRESSION",
        dataType: left.dataType ? left.dataType : right.dataType,
        operator,
        left,
        right,
      } as BinaryExpression;
    }

    return left;
  }

  private parseMultiplicativeExpression(): Expression {
    let left = this.parseLogicalUnaryExpression();

    while (
      !this.reader.isEnd() &&
      this.currentToken.type === "ARITHMETIC_OPERATOR" &&
      (this.currentToken.value === "*" ||
        this.currentToken.value === "/" ||
        this.currentToken.value === "%")
    ) {
      const operator = this.reader.eat()!.value;
      const right = this.parseLogicalUnaryExpression();

      this.assertExpressionDataTypeMatching(left, right);

      left = {
        type: "BINARY_EXPRESSION",
        dataType: left.dataType ? left.dataType : right.dataType,
        operator,
        left,
        right,
      } as Expression;
    }

    return left;
  }

  private parseLogicalUnaryExpression(): Expression {
    const token = this.currentToken;

    if (token.type === "LOGICAL_OPERATOR" && token.value === "DILI") {
      this.reader.eat();
      const left = this.createLiteral("TINUOD", true);
      const right = this.parseArithmeticUnaryExpression();
      this.assertExpressionDataTypeMatching(left as Expression, right);

      return {
        type: "BINARY_EXPRESSION",
        dataType: right.dataType,
        operator: "UG",
        isNegative: true,
        left: this.createLiteral("TINUOD", true),
        right: right,
      } as BinaryExpression;
    }

    return this.parseArithmeticUnaryExpression();
  }

  private parseArithmeticUnaryExpression(): Expression {
    const token = this.currentToken;

    if (
      token.type === "ARITHMETIC_OPERATOR" &&
      (token.value === "-" || token.value === "+")
    ) {
      this.reader.eat();
      const right = this.parsePrimaryExpression();
      const left = this.createLiteral("NUMERO", 0);
      this.assertExpressionDataTypeMatching(left as Expression, right);

      return {
        type: "BINARY_EXPRESSION",
        dataType: right.dataType,
        operator: token.value[0],
        left,
        right,
      } as BinaryExpression;
    }

    return this.parsePrimaryExpression();
  }

  private getDefaultValueOfType(type: DataType): any {
    switch (type) {
      case "NUMERO":
        return 0;
      case "TIPIK":
        return 0.0;
      case "TINUOD":
        return false;
      case "LETRA":
        return "";
      case "STRING":
        return "";
      default:
        return null;
    }
  }

  private createLiteral(
    type: DataType,
    value: any = this.getDefaultValueOfType(type),
  ): Expression {
    switch (type) {
      case "NUMERO":
        return {
          type: "NUMERIC_LITERAL",
          value,
          dataType: type,
        } as NumericLiteral;
      case "TIPIK":
        return {
          type: "NUMERIC_LITERAL",
          value,
          dataType: type,
        } as NumericLiteral;
      case "TINUOD":
        return {
          type: "BOOLEAN_LITERAL",
          value,
          dataType: type,
        } as BooleanLiteral;
      case "LETRA":
        return {
          type: "CHAR_LITERAL",
          value,
          dataType: type,
        } as CharLiteral;
      case "STRING":
        return {
          type: "STRING_LITERAL",
          value,
          dataType: type,
        } as StringLiteral;
      default:
        throw new DatatypeNotFoundException(
          "" + type,
          this.reader.getCurrentPosition(),
        );
    }
  }

  private parsePrimaryExpression(): Expression {
    const token = this.currentToken;

    switch (token.type) {
      case "IDENTIFIER":
        if (!this.isIdentifierPresent(token.value)) {
          throw new IdentifierNotFoundException(
            token.value,
            this.reader.getCurrentPosition(),
          );
        }

        return {
          type: "IDENTIFIER",
          value: this.reader.eat()!.value,
          dataType: this.isIdentifierPresent(token.value)
            ? this.identifierDataTypes.get(token.value)!
            : undefined,
        } as Identifier;

      case "WHOLE_NUMERIC_LITERAL":
        return this.createLiteral("NUMERO", parseInt(this.reader.eat()!.value));

      case "DECIMAL_NUMERIC_LITERAL":
        return this.createLiteral(
          "TIPIK",
          parseFloat(this.reader.eat()!.value),
        );

      case "BOOLEAN_LITERAL":
        return this.createLiteral("TINUOD", this.reader.eat()!.value === "OO");

      case "CHAR_LITERAL":
        return this.createLiteral("LETRA", this.reader.eat()!.value);

      case "STRING":
        return this.createLiteral("STRING", this.reader.eat()!.value);

      case "ESCAPED_CHAR":
        return this.createLiteral("LETRA", this.reader.eat()!.value);

      case "CARRIAGE_RETURN":
        return this.createLiteral("LETRA", this.reader.eat()!.value);

      case "OPEN_PARENTHESIS":
        this.reader.eat();
        const expression = this.parseExpression();
        this.reader.expectType(
          "CLOSE_PARENTHESIS",
          "Expected closing parenthesis",
        );
        return expression;

      case "CLOSE_PARENTHESIS":
        return {} as NullLiteral;

      case "NEWLINE":
        this.reader.eat();
        return {} as NullLiteral;

      default:
        throw new UnexpectedTokenException(
          `Unexpected token type: ${token.type} with value: ${token.value}`,
          this.reader.getCurrentPosition(),
        );
    }
  }
}
