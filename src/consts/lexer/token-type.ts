/**
 * Token types used throughout the lexer and parser.
 * Each string represents a distinct token category.
 */
export const TokenType = [
  // Block structure tokens
  "START_BLOCK",
  "END_BLOCK",

  // Control flow tokens
  "CONDITIONAL_DECLARATION",
  "CODE_BLOCK_DECLARATION",
  "FOR_LOOP_DECLARATION",

  // Syntax elements
  "NEWLINE",
  "VARIABLE_DECLARATION",
  "IDENTIFIER",

  // I/O operations
  "INPUT_STATEMENTS",
  "OUTPUT_STATEMENTS",

  // Grouping symbols
  "OPEN_PARENTHESIS",
  "CLOSE_PARENTHESIS",

  // Special characters
  "ESCAPED_CHAR",

  // Operators
  "LOGICAL_OPERATOR",
  "RELATIONAL_OPERATOR",
  "ARITHMETIC_OPERATOR",
  "ASSIGNMENT_OPERATOR",

  // Punctuation
  "COMMA",
  "COLON",
  "AMPERSAND",
  "CARRIAGE_RETURN",

  // Literal values
  "STRING",
  "BOOLEAN_LITERAL",
  "WHOLE_NUMERIC_LITERAL",
  "DECIMAL_NUMERIC_LITERAL",
  "CHAR_LITERAL",

  // Type specifiers
  "DATATYPE",
  "NULL",

  // End of file marker
  "EOF",
] as const;

// Type definition for TokenType - extracts string literal union type from the array
export type TokenType = (typeof TokenType)[number];
