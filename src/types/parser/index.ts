import type { ASTNodeTypes } from "../../modules/parser/consts/ast-node-types";

export interface Statement {
  type: ASTNodeTypes;
}

export interface Program extends Statement {
  type: ASTNodeTypes.PROGRAM;
  body: Expression[];
}

export interface Expression extends Statement {}

export interface BinaryExpression extends Expression {
  type: ASTNodeTypes.BINARY_EXPRESSION;
  left: Expression;
  right: Expression;
  operator: string;
}

export interface Identifier extends Expression {
  type: ASTNodeTypes.IDENTIFIER;
  value: string;
}

export interface NumericLiteral extends Expression {
  type: ASTNodeTypes.NUMERIC_LITERAL;
  value: number;
}
