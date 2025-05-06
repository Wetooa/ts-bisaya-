import { TokenType } from "./token-type";

export const KEYWORDS: Record<string, TokenType> = {
  // Block-related keywords
  SUGOD: "START_BLOCK",
  KATAPUSAN: "END_BLOCK",
  KUNG: "CONDITIONAL_BLOCK",

  // Variable declaration
  MUGNA: "VARIABLE_DECLARATION",

  // I/O statements
  DAWAT: "INPUT_STATEMENTS",
  IPAKITA: "OUTPUT_STATEMENTS",

  // Logical operators
  UG: "LOGICAL_OPERATOR",
  O: "LOGICAL_OPERATOR",
  DILI: "LOGICAL_OPERATOR",

  // Boolean value
  OO: "BOOLEAN_LITERAL",

  // Loops
  "ALANG SA": "FOR_LOOP",

  // Data types
  NUMERO: "DATATYPE",
  LETRA: "DATATYPE",
  TINUOD: "DATATYPE",
  TIPIK: "DATATYPE",
};
