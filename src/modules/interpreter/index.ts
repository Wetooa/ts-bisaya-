import * as readline from "readline-sync";
import { InvalidVariableTypeError } from "../../exceptions/interpreter";
import type { AST, ASTNode } from "../../types/interpreter";
import type {
  BinaryExpression,
  Expression,
  NumericLiteral,
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
  if (expression.type === "BINARY_EXPRESSION") {
    evaluate_numeric_expression(expression as BinaryExpression);
  } else if (expression.type === "VARIABLE_DECLARATION") {
    evaluate_variable_declaration(expression as VariableDeclaration);
  }
}

// Evaluate functions

// Numeric
export function evaluate_numeric_expression(root: Expression) {
  if (root.type === "NUMERIC_LITERAL") {
    return (root as NumericLiteral).value;
  } else if (root.type === "BINARY_EXPRESSION") {
    let leftValue: number = evaluate_numeric_expression(
      (root as BinaryExpression).left
    );
    let rightValue: number = evaluate_numeric_expression(
      (root as BinaryExpression).right
    );

    return eval(
      `${leftValue} ${(root as BinaryExpression).operator} ${rightValue}`
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
        `${variable.value} is not compatible for ${dataType}`
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
function evaluate_ipakita(head: ASTNode) {
  var printStack: string[] = [];
  parseIpakita(head.left as ASTNode, printStack);

  let res = "";
  printStack.forEach((elem) => {
    if (elem === "&") {
      return;
    } else {
      res += variableDictionary.get(elem);
    }
  });
  console.log(res);
}

function parseIpakita(head: ASTNode, printStack: string[]) {
  if (head.value === "&") {
    parseIpakita(head.left as ASTNode, printStack);
    printStack.push(head.value);
    parseIpakita(head.right as ASTNode, printStack);
  } else {
    printStack.push(head.value);
  }
}

// DAWAT
async function evaluate_dawat(head: ASTNode) {
  let variables = [];

  head = head.left!;

  while (head) {
    variables.push(head.value);
    head = head.right!;
  }

  const line1 = readline.question("");

  const variableElements = line1.split(",");

  for (let i = 0; i < variables.length; i++) {
    variableDictionary.set(variables[i], variableElements![i]);
  }
}
