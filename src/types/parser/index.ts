import { ASTNodeTypes } from "../../consts/parser/ast-node-types";

export interface Statement {
  type: ASTNodeTypes;
}

export interface Program extends Statement {
  type: "PROGRAM";
  body: Expression[];
}

export interface Expression extends Statement {}

export interface BinaryExpression extends Expression {
  type: "BINARY_EXPRESSION";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface Identifier extends Expression {
  type: "IDENTIFIER";
  value: string;
}

export interface NumericLiteral extends Expression {
  type: "NUMERIC_LITERAL";
  value: number;
}
