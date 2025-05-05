import { UnknownCharacterException } from "../../../exceptions/lexer";

import { isSkippable } from "../utils";
import { StateType } from "./state-type";

type TransitionFunction = (c: string) => StateType;

export const transitions = new Map<StateType, TransitionFunction>();

transitions.set(StateType.START, (c: string): StateType => {
  if (/\d/.test(c)) {
    return StateType.DIGIT_WHOLE;
  } else if (/[a-zA-Z]/.test(c) || c === "_") {
    return StateType.ALPHABETIC;
  } else if (c === "\n") {
    return StateType.NEWLINE;
  } else if (c === "-") {
    return StateType.COMMENT;
  } else if (["+", "*", "/", "%", "="].includes(c)) {
    return StateType.ASSIGNMENT_OPERATOR_BEGIN;
  } else if (c === "<") {
    return StateType.LESS_THAN_ARITHMETIC_OPERATOR;
  } else if (c === ">") {
    return StateType.GREATER_THAN_ARITHMETIC_OPERATOR;
  } else if (c === "(") {
    return StateType.OPEN_PARENTHESIS;
  } else if (c === ")") {
    return StateType.CLOSE_PARENTHESIS;
  } else if (c === "[") {
    return StateType.ESCAPED_CHAR;
  } else if (isSkippable(c)) {
    return StateType.SKIPPABLE;
  } else if (c === ",") {
    return StateType.COMMA;
  } else if (c === "&") {
    return StateType.AMPERSAND;
  } else if (c === "$") {
    return StateType.CARRIAGE_RETURN;
  } else if (c === "'") {
    return StateType.SINGLE_QUOTE;
  } else if (c === '"') {
    return StateType.DOUBLE_QUOTE;
  } else if (c === ":") {
    return StateType.COLON;
  } else {
    throw new UnknownCharacterException();
  }
});
transitions.set(StateType.SKIPPABLE, () => StateType.SKIPPABLE_END);
transitions.set(StateType.NEWLINE, () => StateType.NEWLINE_END);
transitions.set(StateType.COMMENT, (c: string): StateType => {
  if (c === "-") {
    return StateType.COMMENT_CONTENT;
  } else if (c === "=") {
    return StateType.ASSIGNMENT_OPERATOR;
  } else {
    return StateType.ARITHMETIC_OPERATOR_END;
  }
});
transitions.set(StateType.COMMENT_CONTENT, (c: string): StateType => {
  return c === "\n" ? StateType.COMMENT_END : StateType.COMMENT_CONTENT;
});
transitions.set(
  StateType.LESS_THAN_ARITHMETIC_OPERATOR,
  (c: string): StateType => {
    if (c === ">" || c === "=" || isSkippable(c)) {
      return StateType.ARITHMETIC_OPERATOR_END;
    }
    throw new UnknownCharacterException();
  },
);
transitions.set(
  StateType.GREATER_THAN_ARITHMETIC_OPERATOR,
  (c: string): StateType => {
    if (c === "=" || isSkippable(c)) {
      return StateType.ARITHMETIC_OPERATOR_END;
    }
    throw new UnknownCharacterException();
  },
);
transitions.set(StateType.ASSIGNMENT_OPERATOR_BEGIN, (c: string): StateType => {
  return c === "="
    ? StateType.ASSIGNMENT_OPERATOR
    : StateType.ARITHMETIC_OPERATOR_END;
});
transitions.set(
  StateType.ASSIGNMENT_OPERATOR,
  () => StateType.ASSIGNMENT_OPERATOR_END,
);
transitions.set(
  StateType.OPEN_PARENTHESIS,
  () => StateType.OPEN_PARENTHESIS_END,
);
transitions.set(
  StateType.CLOSE_PARENTHESIS,
  () => StateType.CLOSE_PARENTHESIS_END,
);
transitions.set(StateType.ESCAPED_CHAR, (c: string): StateType => {
  return c === "]"
    ? StateType.ESCAPED_CHAR_LAST_BRACKET
    : StateType.ESCAPED_CHAR;
});
transitions.set(
  StateType.ESCAPED_CHAR_LAST_BRACKET,
  () => StateType.ESCAPED_CHAR_END,
);
transitions.set(StateType.COMMA, () => StateType.COMMA_END);
transitions.set(StateType.CARRIAGE_RETURN, () => StateType.CARRIAGE_RETURN_END);
transitions.set(StateType.AMPERSAND, () => StateType.AMPERSAND_END);
transitions.set(StateType.COLON, () => StateType.COLON_END);
transitions.set(StateType.SINGLE_QUOTE, (c: string): StateType => {
  return c === "'" ? StateType.SINGLE_QUOTE_LAST_QUOTE : StateType.SINGLE_QUOTE;
});
transitions.set(
  StateType.SINGLE_QUOTE_LAST_QUOTE,
  () => StateType.SINGLE_QUOTE_END,
);
transitions.set(StateType.DOUBLE_QUOTE, (c: string): StateType => {
  return c === '"' ? StateType.DOUBLE_QUOTE_LAST_QUOTE : StateType.DOUBLE_QUOTE;
});
transitions.set(
  StateType.DOUBLE_QUOTE_LAST_QUOTE,
  () => StateType.DOUBLE_QUOTE_END,
);
transitions.set(StateType.ALPHABETIC, (c: string): StateType => {
  if (/[a-zA-Z0-9]/.test(c) || c === "_") {
    return StateType.ALPHABETIC;
  } else {
    return StateType.ALPHABETIC_END;
  }
});
transitions.set(StateType.DIGIT_WHOLE, (c: string): StateType => {
  if (/\d/.test(c)) {
    return StateType.DIGIT_WHOLE;
  } else if (isSkippable(c)) {
    return StateType.DIGIT_END;
  } else {
    throw new UnknownCharacterException();
  }
});
