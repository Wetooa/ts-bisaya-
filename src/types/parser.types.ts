import type { AST_NODE_TYPES } from "../constants/parser/ast-node-types";
import type { DATA_TYPE } from "../constants/parser/data-types";

export type DataType = (typeof DATA_TYPE)[number];
export type ASTNodeTypes = (typeof AST_NODE_TYPES)[number];

export interface Statement {
  type: ASTNodeTypes;
}

export interface Program extends Statement {
  type: "PROGRAM";
  body: Statement[];
}

export interface VariableDeclaration extends Statement {
  type: "VARIABLE_DECLARATION";
  dataType: string;

  variables: {
    identifier: string;
    value?: Expression;
  }[];
}

export interface InputStatement extends Statement {
  type: "INPUT_STATEMENT";
  variables: string[];
}

export interface OutputStatement extends Statement {
  type: "OUTPUT_STATEMENT";
  variables: Expression[];
}

export interface CodeBlock extends Statement {
  type: "CODE_BLOCK";
  body: Statement[];
}

export interface IfStatement extends Statement {
  type: "IF_STATEMENT";
  condition: Expression;
  body: CodeBlock;
  elseIf: {
    condition: Expression;
    body: CodeBlock;
  }[];
  else?: CodeBlock;
}

export interface ForLoop extends Statement {
  type: "FOR_LOOP";
  startExpression: Expression;
  condition: Expression;
  increment: Expression;
  body: CodeBlock;
}

export interface Expression extends Statement {
  dataType: DataType;
  value?: any;
}

export interface AssignmentExpression extends Expression {
  type: "ASSIGNMENT_EXPRESSION";

  assignee: Expression;
  value: Expression;
}

export interface BinaryExpression extends Expression {
  type: "BINARY_EXPRESSION";
  left: Expression;
  right: Expression;
  operator: string;
  isNegative?: boolean;
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

export interface StringLiteral extends Expression {
  type: "STRING_LITERAL";
  value: string;
}

export interface BooleanLiteral extends Expression {
  type: "BOOLEAN_LITERAL";
  value: boolean;
}

export interface NullLiteral extends Expression {
  type: "NULL_LITERAL";
}
