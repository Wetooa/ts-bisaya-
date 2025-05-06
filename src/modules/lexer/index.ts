import { KEYWORDS } from "../../consts/lexer/keywords";
import { StateType } from "../../consts/lexer/state-type";
import { TokenType } from "../../consts/lexer/token-type";
import { LexerException } from "../../exceptions/lexer";
import type { Token } from "../../types/lexer";
import { inputCleaning, isResetState } from "../../utils/lexer";
import { createToken } from "./token";
import { transition } from "./tokenizer-state";

export function tokenize(input: string): Token[] {
  input = inputCleaning(input);

  const tokens: Token[] = [];
  let state: StateType = StateType.START;
  let value: string = "";

  let i = 0;

  while (i < input.length) {
    const c = input.charAt(i);

    try {
      state = transition(state, c);
    } catch (e) {
      if (e instanceof LexerException) {
        throw e;
      } else {
        throw new LexerException(`Unexpected error during tokenization: ${e}`);
      }
    }

    // console.log(`${c} ${StateType[state]}`);

    if (isResetState(state)) {
      const tokenValue = value.trim();

      switch (state) {
        case StateType.START:
          // console.log(`Encountered a start state: ${StateType[state]}`);
          break;

        case StateType.SKIPPABLE_END:
          // console.log(`Encountered a skippable character: ${tokenValue}`);
          break;

        case StateType.COMMENT_END:
          // console.log(`Encountered a comment: ${tokenValue}`);
          break;

        case StateType.ARITHMETIC_OPERATOR_END:
          tokens.push(createToken(TokenType.ARITHMETIC_OPERATOR, tokenValue));
          break;

        case StateType.ASSIGNMENT_OPERATOR_END:
          tokens.push(createToken(TokenType.ASSIGNMENT_OPERATOR, tokenValue));
          break;

        case StateType.OPEN_PARENTHESIS_END:
          tokens.push(createToken(TokenType.OPEN_PARENTHESIS, tokenValue));
          break;

        case StateType.CLOSE_PARENTHESIS_END:
          tokens.push(createToken(TokenType.CLOSE_PARENTHESIS, tokenValue));
          break;

        case StateType.SINGLE_QUOTE_END:
          tokens.push(createToken(TokenType.STRING, tokenValue));
          break;

        case StateType.DOUBLE_QUOTE_END:
          const content = tokenValue.substring(1, tokenValue.length - 1);
          if (content === "OO" || content === "DILI") {
            tokens.push(createToken(TokenType.BOOLEAN_VALUE, content));
          } else {
            tokens.push(createToken(TokenType.STRING, tokenValue));
          }
          break;

        case StateType.COMMA_END:
          tokens.push(createToken(TokenType.COMMA, tokenValue));
          break;

        case StateType.COLON_END:
          tokens.push(createToken(TokenType.COLON, tokenValue));
          break;

        case StateType.AMPERSAND_END:
          tokens.push(createToken(TokenType.LOGICAL_OPERATOR, tokenValue));
          break;

        case StateType.CARRIAGE_RETURN_END:
          tokens.push(createToken(TokenType.CARRIAGE_RETURN, tokenValue));
          break;

        case StateType.DIGIT_END:
          tokens.push(createToken(TokenType.NUMERIC_LITERAL, tokenValue));
          break;

        case StateType.ALPHABETIC_END:
          if (tokenValue in KEYWORDS) {
            tokens.push(
              createToken(KEYWORDS[tokenValue] as TokenType, tokenValue),
            );
          } else {
            tokens.push(createToken(TokenType.IDENTIFIER, tokenValue));
          }
          break;

        case StateType.NEWLINE_END:
          tokens.push(createToken(TokenType.NEWLINE, tokenValue));
          break;

        default:
          console.error(
            `Error: Unhandled Tokenizer End State: ${StateType[state]}`,
          );
      }

      value = "";
    } else {
      value += c;
      i++;
    }
  }

  return tokens;
}
