import * as readline from "readline-sync";
import { InvalidVariableTypeError } from "../../exceptions/interpreter";
import type { AST, ASTNode } from "../../types/interpreter";
import type {
  BinaryExpression,
  Expression,
  InputStatement,
  NumericLiteral,
  OutputStatement,
  Program,
  VariableDeclaration,
} from "../../types/parser";
``;
var variableDictionary = new Map();

export default function interpret(lines: Program) {
  lines.body.forEach((line) => {
    interpret_helper(line);
  });
}

function interpret_helper(expression: Expression) {
  switch (expression.type) {
    case "BINARY_EXPRESSION":
      evaluate_numeric_expression(expression as BinaryExpression);
      break;
    case "VARIABLE_DECLARATION":
      evaluate_variable_declaration(expression as VariableDeclaration);
      break;
    case "INPUT_STATEMENT":
      evaluate_dawat(expression as InputStatement);
      break;
    case "OUTPUT_STATEMENT":
      evaluate_ipakita(expression as OutputStatement);
      break;
  }
}

// Evaluate functions
// Numeric
export function evaluate_numeric_expression(root: Expression) {
  if (root.type === "NUMERIC_LITERAL") {
    return (root as NumericLiteral).value;
  } else if (root.type === "BINARY_EXPRESSION") {
    let leftValue: number = evaluate_numeric_expression(
      (root as BinaryExpression).left,
    );
    let rightValue: number = evaluate_numeric_expression(
      (root as BinaryExpression).right,
    );
    return eval(
      `${leftValue} ${(root as BinaryExpression).operator} ${rightValue}`,
    );
  }
}

// Variable declaration
function evaluate_variable_declaration(statement: Expression) {
  let dataType = (statement as VariableDeclaration).dataType;

  (statement as VariableDeclaration).variables.forEach((variable) => {
    if (checkVariable(variable.value, dataType)) {
      variableDictionary.set(variable.identifier, variable.value);
    } else {
      throw new InvalidVariableTypeError(
        `${variable.value} is not compatible for ${dataType}`,
      );
    }
  });
}

// MUGNA HELPERS
function checkVariable(element: any, data_type: string) {
  switch (data_type) {
    case "LETRA":
      return typeof element === "string" && /\'.\'/.test(element);
    case "NUMERO":
      return typeof element === "number" && Number.isInteger(element);
    case "TINUOD":
      return (
        typeof element === "string" && (element === "OO" || element === "DILI")
      );
    case "TIPIK":
      return typeof element === "number" && !Number.isInteger(element);
  }
}

// IPAKITA
function evaluate_ipakita(expression: Expression) {
  let res = "";

  (expression as OutputStatement).variables.forEach((variable) => {
    switch (variable) {
      case "&":
        res += "";
        break;
      default:
        res += variableDictionary.get(variable);
    }
  });

  console.log(res);
}

// DAWAT
async function evaluate_dawat(expression: Expression) {
  let variables: string[] = [];

  (expression as InputStatement).variables.forEach((variable) => {
    variables.push(variable);
  });

  const line1 = readline.question("");

  const variableElements = line1.split(",");

  for (let i = 0; i < variables.length; i++) {
    variableDictionary.set(variables[i], variableElements![i]);
  }
}
