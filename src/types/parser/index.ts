import type { ASTNodeType } from "../../consts/parser/ast-node-types";

export interface Statement {
  type: (typeof ASTNodeType)[keyof typeof ASTNodeType];
}

export interface Program extends Statement {
  type: "PROGRAM";
  body: Expression[];
}

export interface VariableDeclaration extends Statement {
  type: "VARIABLE_DECLARATION";

  dataType: string;

  variables: {
    identifier: string;
    value?: Expression;
  }[];
}

export interface AssignmentExpression extends Statement {
  type: "ASSIGNMENT_EXPRESSION";

  assignee: Expression;
  value: Expression;
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

export interface CharLiteral extends Expression {
  type: "CHAR_LITERAL";
  value: string;
}

export interface BooleanLiteral extends Expression {
  type: "BOOLEAN_LITERAL";
  value: boolean;
}

export interface NullLiteral extends Expression {
  type: "NULL_LITERAL";
}
