import { TokenType } from "./token-type";

/**
 * Maps language-specific keywords to their corresponding token types.
 * This enables the lexer to identify special words in the source language.
 */
export const KEYWORDS: Record<string, TokenType> = {
  // Block structure keywords
  SUGOD: "START_BLOCK", // Start of a block (equivalent to "begin")
  KATAPUSAN: "END_BLOCK", // End of a block (equivalent to "end")

  // Conditional
  KUNG: "CONDITIONAL_DECLARATION", // Conditional block (equivalent to "if")
  PUNDOK: "CODE_BLOCK_DECLARATION", // Else block (equivalent to "else")

  // Function declaration keyword
  ALANG: "FOR_LOOP_DECLARATION",
  SA: "FOR_LOOP_DECLARATION",

  // Variable declaration keyword
  MUGNA: "VARIABLE_DECLARATION", // Create/declare a variable (equivalent to "let" or "var")

  // I/O operation keywords
  DAWAT: "INPUT_STATEMENTS", // Input statement (equivalent to "input" or "read")
  IPAKITA: "OUTPUT_STATEMENTS", // Output statement (equivalent to "print" or "write")

  // Logical operator keywords
  UG: "LOGICAL_OPERATOR", // Logical AND operator (equivalent to "and")
  O: "LOGICAL_OPERATOR", // Logical OR operator (equivalent to "or")
  DILI: "LOGICAL_OPERATOR", // Logical NOT operator (equivalent to "not")

  // Boolean literal
  OO: "BOOLEAN_LITERAL", // True/Yes value (equivalent to "true")

  // Data type keywords
  NUMERO: "DATATYPE", // Integer number type
  LETRA: "DATATYPE", // Character type
  TINUOD: "DATATYPE", // Boolean type
  TIPIK: "DATATYPE", // Floating-point/decimal type
};
