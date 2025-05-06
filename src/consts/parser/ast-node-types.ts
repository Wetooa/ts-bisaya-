export const ASTNodeTypes = {
  PROGRAM: "PROGRAM",
  NUMERIC_LITERAL: "NUMERIC_LITERAL",
  IDENTIFIER: "IDENTIFIER",
  BINARY_EXPRESSION: "BINARY_EXPRESSION",
} as const;

export type ASTNodeTypes = (typeof ASTNodeTypes)[keyof typeof ASTNodeTypes];
