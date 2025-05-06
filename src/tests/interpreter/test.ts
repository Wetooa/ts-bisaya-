import interpret, {
  evaluate_numeric_expression,
} from "../../modules/interpreter";
import type { BinaryExpression } from "../../types/parser";

// A more complex example: "3 4 + 5 *" (which means (3 + 4) * 5)
const complexPostfixTree: BinaryExpression = {
  type: "BINARY_EXPRESSION",
  operator: "*",
  left: {
    type: "BINARY_EXPRESSION",
    operator: "+",
    left: {
      type: "NUMERIC_LITERAL",
      value: 3,
    },
    right: {
      type: "NUMERIC_LITERAL",
      value: 4,
    },
  },
  right: {
    type: "NUMERIC_LITERAL",
    value: 5,
  },
};

console.log(evaluate_numeric_expression(complexPostfixTree));
