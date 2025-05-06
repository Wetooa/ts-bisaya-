import * as readline from "readline-sync";
import { InvalidDataType } from "../../exceptions/interpreter/errors";
import type { AST, ASTNode } from "../../types/interpreter";
import type {
  BinaryExpression,
  Expression,
  NumericLiteral,
} from "../../types/parser";

var variableDictionary = new Map();

export default function interpret(lines: AST[]) {
  lines.forEach((line) => {
    interpret_helper(line);
  });
}

function interpret_helper(Tree: AST) {
  if (Tree.root?.value === "MUGNA") {
    evaluate_mugna(Tree.root);
  } else if (Tree.root?.value === "IPAKITA") {
    evaluate_ipakita(Tree.root);
  } else if (Tree.root?.value === "DAWAT") {
    evaluate_dawat(Tree.root);
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

// MUGNA Initialization

function evaluate_mugna(head: ASTNode) {
  let data_type: string = head.left?.value as string;
  if (["NUMERO", "LETRA", "TINUOD", "TIPIK"].includes(data_type) == false) {
    throw new InvalidDataType(
      `Got ${data_type} should be ${'["NUMERO", "LETRA", "TINUOD", "TIPIK"]'}`
    );
  }
  parseVariables(data_type, head.left!.left!);
}

// MUGNA HELPERS
enum parsingState {
  VARIABLE,
  ELEMENT,
}

function parseVariables(dataType: string, head: ASTNode) {
  let stack = [];

  while (head) {
    if (checkVariable(head.value, dataType)) {
      let tempElem = stack.pop();
      variableDictionary.set(tempElem, head.value);
    } else if (typeof head.value === "string") {
      stack.push(head.value);
    }

    head = head.right!;
  }

  while (stack.length != 0) {
    variableDictionary.set(stack.pop(), "ambot");
  }
}

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
