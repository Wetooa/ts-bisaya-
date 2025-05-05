import { TokenType } from "./token-type";

export const KEYWORDS: Record<string, TokenType> = {
  // Block-related keywords
  SUGOD: TokenType.START_BLOCK,
  KATAPUSAN: TokenType.END_BLOCK,
  KUNG: TokenType.CONDITIONAL_BLOCK,

  // Variable declaration
  MUGNA: TokenType.VARIABLE_DECLARATION,

  // I/O statements
  DAWAT: TokenType.INPUT_STATEMENTS,
  IPAKITA: TokenType.OUTPUT_STATEMENTS,

  // Logical operators
  UG: TokenType.LOGICAL_OPERATOR,
  O: TokenType.LOGICAL_OPERATOR,
  DILI: TokenType.LOGICAL_OPERATOR,

  // Boolean value
  OO: TokenType.BOOLEAN_VALUE,

  // Loops
  "ALANG SA": TokenType.FOR_LOOP,

  // Data types
  NUMERO: TokenType.DATATYPE,
  LETRA: TokenType.DATATYPE,
  TINUOD: TokenType.DATATYPE,
  TIPIK: TokenType.DATATYPE,
};
