import { UnknownCharacterException } from "../../exceptions/lexer";
import { isSkippable, isSymbol } from "../../utils/lexer";
import { StateType } from "./state-type";

type TransitionFunction = (c: string) => StateType;

export const transitions: Record<StateType, TransitionFunction> = {
  [StateType.START]: (c: string): StateType => {
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
  },

  [StateType.SKIPPABLE]: () => StateType.SKIPPABLE_END,

  [StateType.NEWLINE]: () => StateType.NEWLINE_END,

  [StateType.COMMENT]: (c: string): StateType => {
    if (c === "-") {
      return StateType.COMMENT_CONTENT;
    } else if (c === "=") {
      return StateType.ASSIGNMENT_OPERATOR;
    } else {
      return StateType.ARITHMETIC_OPERATOR_END;
    }
  },

  [StateType.COMMENT_CONTENT]: (c: string): StateType => {
    return c === "\n" ? StateType.COMMENT_END : StateType.COMMENT_CONTENT;
  },

  [StateType.LESS_THAN_ARITHMETIC_OPERATOR]: (c: string): StateType => {
    if (c === "=") {
      return StateType.NOT_EQUAL_ARITHMETIC_OPERATOR;
    }
    if (c === ">") {
      return StateType.LESS_THAN_OR_EQUAL_ARITHMETIC_OPERATOR;
    }
    if (isSkippable(c)) {
      return StateType.ARITHMETIC_OPERATOR_END;
    }
    throw new UnknownCharacterException();
  },

  [StateType.GREATER_THAN_ARITHMETIC_OPERATOR]: (c: string): StateType => {
    if (c === "=") {
      return StateType.GREATER_THAN_OR_EQUAL_ARITHMETIC_OPERATOR;
    }
    if (isSkippable(c)) {
      return StateType.ARITHMETIC_OPERATOR_END;
    }
    throw new UnknownCharacterException();
  },

  [StateType.LESS_THAN_OR_EQUAL_ARITHMETIC_OPERATOR]: function (
    _c: string,
  ): StateType {
    return StateType.ARITHMETIC_OPERATOR_END;
  },

  [StateType.GREATER_THAN_OR_EQUAL_ARITHMETIC_OPERATOR]: function (
    _c: string,
  ): StateType {
    return StateType.ARITHMETIC_OPERATOR_END;
  },

  [StateType.NOT_EQUAL_ARITHMETIC_OPERATOR]: function (_c: string): StateType {
    return StateType.ARITHMETIC_OPERATOR_END;
  },

  [StateType.ASSIGNMENT_OPERATOR_BEGIN]: (c: string): StateType => {
    if (c === "=" || isSkippable(c)) {
      return StateType.ASSIGNMENT_OPERATOR;
    }
    return StateType.ARITHMETIC_OPERATOR_END;
  },

  [StateType.ASSIGNMENT_OPERATOR]: () => StateType.ASSIGNMENT_OPERATOR_END,

  [StateType.OPEN_PARENTHESIS]: () => StateType.OPEN_PARENTHESIS_END,

  [StateType.CLOSE_PARENTHESIS]: () => StateType.CLOSE_PARENTHESIS_END,

  [StateType.ESCAPED_CHAR]: (c: string): StateType => {
    return c === "]"
      ? StateType.ESCAPED_CHAR_LAST_BRACKET
      : StateType.ESCAPED_CHAR;
  },

  [StateType.ESCAPED_CHAR_LAST_BRACKET]: () => StateType.ESCAPED_CHAR_END,

  [StateType.COMMA]: () => StateType.COMMA_END,

  [StateType.CARRIAGE_RETURN]: () => StateType.CARRIAGE_RETURN_END,

  [StateType.AMPERSAND]: () => StateType.AMPERSAND_END,

  [StateType.COLON]: () => StateType.COLON_END,

  [StateType.SINGLE_QUOTE]: (c: string): StateType => {
    return c === "'"
      ? StateType.SINGLE_QUOTE_LAST_QUOTE
      : StateType.SINGLE_QUOTE_CHAR;
  },

  [StateType.SINGLE_QUOTE_CHAR]: (c: string): StateType => {
    if (c === "'") {
      return StateType.SINGLE_QUOTE_LAST_QUOTE;
    }
    throw new UnknownCharacterException();
  },

  [StateType.SINGLE_QUOTE_LAST_QUOTE]: () => StateType.SINGLE_QUOTE_END,

  [StateType.DOUBLE_QUOTE]: (c: string): StateType => {
    return c === '"'
      ? StateType.DOUBLE_QUOTE_LAST_QUOTE
      : StateType.DOUBLE_QUOTE;
  },

  [StateType.DOUBLE_QUOTE_LAST_QUOTE]: () => StateType.DOUBLE_QUOTE_END,

  [StateType.ALPHABETIC]: (c: string): StateType => {
    if (/[a-zA-Z0-9]/.test(c) || c === "_") {
      return StateType.ALPHABETIC;
    } else {
      return StateType.ALPHABETIC_END;
    }
  },

  [StateType.DIGIT_WHOLE]: (c: string): StateType => {
    if (/\d/.test(c)) {
      return StateType.DIGIT_WHOLE;
    } else if (c == "\n" || isSkippable(c) || isSymbol(c)) {
      return StateType.DIGIT_END;
    } else {
      throw new UnknownCharacterException();
    }
  },

  // FIX: add these later
  [StateType.DIGIT_AFTER_E]: function (_c: string): StateType {
    return StateType.DIGIT_END;
  },

  [StateType.DIGIT_DECIMAL]: function (_c: string): StateType {
    return StateType.DIGIT_END;
  },

  [StateType.NEWLINE_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.SKIPPABLE_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.COMMENT_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.ARITHMETIC_OPERATOR_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.ASSIGNMENT_OPERATOR_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.OPEN_PARENTHESIS_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.CLOSE_PARENTHESIS_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.ESCAPED_CHAR_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.SINGLE_QUOTE_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.DOUBLE_QUOTE_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.BOOLEAN]: function (_c: string): StateType {
    return StateType.BOOLEAN_END;
  },
  [StateType.BOOLEAN_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.COMMA_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.CARRIAGE_RETURN_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.AMPERSAND_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.COLON_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.ALPHABETIC_END]: function (_c: string): StateType {
    return StateType.START;
  },
  [StateType.DIGIT_END]: function (_c: string): StateType {
    return StateType.START;
  },
};
