export const ASTNodeTypes = [
  "PROGRAM",

  "VARIABLE_DECLARATION",
  "INPUT_STATEMENT",
  "OUTPUT_STATEMENT",

  "IF_STATEMENT",
  "FOR_LOOP",

  "ASSIGNMENT_EXPRESSION",
  "BINARY_EXPRESSION",

  "IDENTIFIER",

  "CHAR_LITERAL",
  "BOOLEAN_LITERAL",
  "NUMERIC_LITERAL",

  "NULL_LITERAL",
] as const;

export interface Statement {
  type: (typeof ASTNodeTypes)[number];
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

export interface InputStatement extends Statement {
  type: "INPUT_STATEMENT";
  variables: string[];
}

export interface OutputStatement extends Statement {
  type: "OUTPUT_STATEMENT";
  variables: string[];
}

export interface Expression extends Statement {}

export interface AssignmentExpression extends Expression {
  type: "ASSIGNMENT_EXPRESSION";

  dataType: string;
  assignee: Expression;
  value: Expression;
}

export interface BinaryExpression extends Expression {
  type: "BINARY_EXPRESSION";
  left: Expression;
  right: Expression;
  dataType: string;
  operator: string;
}

export interface Identifier extends Expression {
  type: "IDENTIFIER";
  value: string;
  dataType: string;
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
