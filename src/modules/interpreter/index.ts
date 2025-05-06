import type { DataType } from "../../consts/parser/datatype";
import type {
  AssignmentExpression,
  BinaryExpression,
  BooleanLiteral,
  CharLiteral,
  CodeBlock,
  Expression,
  ForLoop,
  Identifier,
  IfStatement,
  InputStatement,
  NumericLiteral,
  OutputStatement,
  Program,
  Statement,
  StringLiteral,
  VariableDeclaration,
} from "../../types/parser";

export class Interpreter {
  private variables: Map<
    string,
    { type: DataType; value: number | boolean | string | null }
  >;
  private input: string[];
  private output: string;
  private inputIndex: number;

  constructor(input: string[] = []) {
    this.variables = new Map();
    this.input = input;
    this.output = "";
    this.inputIndex = 0;
  }

  public interpret(program: Program): string {
    this.executeStatements(program.body);
    return this.output;
  }

  private executeStatements(statements: Statement[]): void {
    for (const statement of statements) {
      this.executeStatement(statement);
    }
  }

  private executeStatement(statement: Statement): any {
    if (!statement.type) return; // Handle empty statements

    switch (statement.type) {
      case "PROGRAM":
        return this.executeStatements((statement as Program).body);
      case "VARIABLE_DECLARATION":
        return this.executeVariableDeclaration(
          statement as VariableDeclaration
        );
      case "ASSIGNMENT_EXPRESSION":
        return this.executeAssignmentExpression(
          statement as AssignmentExpression
        );
      case "INPUT_STATEMENT":
        return this.executeInputStatement(statement as InputStatement);
      case "OUTPUT_STATEMENT":
        return this.executeOutputStatement(statement as OutputStatement);
      case "IF_STATEMENT":
        return this.executeIfStatement(statement as IfStatement);
      case "FOR_LOOP":
        return this.executeForLoop(statement as ForLoop);
      case "CODE_BLOCK":
        return this.executeCodeBlock(statement as CodeBlock);
      default:
        if ((statement as Expression).dataType !== undefined) {
          return this.evaluateExpression(statement as Expression);
        }
        throw new Error(`Unknown statement type: ${statement.type}`);
    }
  }

  private executeVariableDeclaration(declaration: VariableDeclaration): void {
    for (const variable of declaration.variables) {
      const value = variable.value
        ? this.evaluateExpression(variable.value)
        : this.getDefaultValueForType(declaration.dataType);

      this.variables.set(variable.identifier, {
        type: declaration.dataType as DataType,
        value,
      });
    }
  }

  private executeAssignmentExpression(assignment: AssignmentExpression): any {
    const value = this.evaluateExpression(assignment.value);

    if (assignment.assignee.type === "IDENTIFIER") {
      const identifier = assignment.assignee as Identifier;
      const variableName = identifier.value;

      if (!this.variables.has(variableName)) {
        throw new Error(`Variable ${variableName} is not defined`);
      }

      const variable = this.variables.get(variableName)!;

      if (variable.type !== assignment.dataType) {
        throw new Error(
          `Type mismatch: cannot assign ${assignment.dataType} to ${variable.type}`
        );
      }

      variable.value = value;
      return value;
    }

    throw new Error(`Cannot assign to non-identifier`);
  }

  private executeInputStatement(statement: InputStatement): void {
    for (const variableName of statement.variables) {
      if (!this.variables.has(variableName)) {
        throw new Error(`Variable ${variableName} is not defined`);
      }

      const variable = this.variables.get(variableName)!;
      let inputValue = this.input[this.inputIndex++] || "";

      // Convert input based on variable type
      switch (variable.type) {
        case "INT":
          variable.value = parseInt(inputValue) || 0;
          break;
        case "FLOAT":
          variable.value = parseFloat(inputValue) || 0.0;
          break;
        case "CHAR":
          variable.value = inputValue.charAt(0) || "";
          break;
        case "BOOLEAN":
          variable.value = inputValue === "OO";
          break;
        default:
          variable.value = inputValue;
      }
    }
  }

  private executeOutputStatement(statement: OutputStatement): void {
    for (const variable of statement.variables) {
      let value;

      if (variable.type === "IDENTIFIER") {
        const identifierName = variable.identifierName;
        if (!this.variables.has(identifierName)) {
          throw new Error(`Variable ${identifierName} is not defined`);
        }

        const identifierValue = this.variables.get(identifierName)!;

        if (identifierValue.type === "BOOLEAN") {
          value = identifierValue.value ? "OO" : "DILI";
        } else {
          value = this.variables.get(identifierName)!.value;
        }
      } else if (variable.type === "LITERAL") {
        value =
          typeof variable.value === "boolean"
            ? variable.value
              ? "OO"
              : "DILI"
            : variable.value;
      }

      this.output += value;
    }
  }

  private executeIfStatement(statement: IfStatement): void {
    if (this.evaluateExpression(statement.condition)) {
      this.executeCodeBlock(statement.body);
    } else {
      let elseIfExecuted = false;

      for (const elseIf of statement.elseIf) {
        if (this.evaluateExpression(elseIf.condition)) {
          this.executeCodeBlock(elseIf.body);
          elseIfExecuted = true;
          break;
        }
      }

      if (!elseIfExecuted && statement.else) {
        this.executeCodeBlock(statement.else);
      }
    }
  }

  private executeForLoop(statement: ForLoop): void {
    // Initialize loop variable
    const variableName = statement.identifier;
    const startValue = this.evaluateExpression(statement.startValue);

    if (!this.variables.has(variableName)) {
      throw new Error(`Loop variable ${variableName} is not defined`);
    }

    const variable = this.variables.get(variableName)!;
    variable.value = startValue;

    // Loop execution
    while (this.evaluateExpression(statement.condition)) {
      this.executeCodeBlock(statement.body);
      this.evaluateExpression(statement.increment); // Update the loop variable
    }
  }

  private executeCodeBlock(block: CodeBlock): void {
    this.executeStatements(block.body);
  }

  private evaluateExpression(expression: Expression): any {
    switch (expression.type) {
      case "NUMERIC_LITERAL":
        return (expression as NumericLiteral).value;
      case "CHAR_LITERAL":
        return (expression as CharLiteral).value;
      case "STRING_LITERAL":
        return (expression as StringLiteral).value;
      case "BOOLEAN_LITERAL":
        return (expression as BooleanLiteral).value;
      case "IDENTIFIER": {
        const identifier = expression as Identifier;
        const variableName = identifier.value;

        if (!this.variables.has(variableName)) {
          throw new Error(`Variable ${variableName} is not defined`);
        }

        return this.variables.get(variableName)!.value;
      }
      case "BINARY_EXPRESSION":
        return this.evaluateBinaryExpression(expression as BinaryExpression);
      case "ASSIGNMENT_EXPRESSION":
        return this.executeAssignmentExpression(
          expression as AssignmentExpression
        );
      default:
        throw new Error(`Unknown expression type: ${expression.type}`);
    }
  }

  private evaluateBinaryExpression(expression: BinaryExpression): any {
    const left = this.evaluateExpression(expression.left);
    const right = this.evaluateExpression(expression.right);
    const op = expression.operator;

    switch (op) {
      // Arithmetic operators
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "%":
        return left % right;

      // Relational operators
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case "==":
        return left === right;
      case "<>":
        return left !== right;

      // Logical operators
      case "UG":
        return left && right;
      case "O":
        return left || right;

      default:
        throw new Error(`Unknown binary operator: ${op}`);
    }
  }

  private getDefaultValueForType(dataType: string): any {
    switch (dataType) {
      case "INT":
        return 0;
      case "FLOAT":
        return 0.0;
      case "CHAR":
        return "";
      case "BOOLEAN":
        return false;
      case "STRING":
        return "";
      default:
        return null;
    }
  }
}

// Factory function for backward compatibility
export function interpret(program: Program, input: string[] = []): string {
  const interpreter = new Interpreter(input);
  return interpreter.interpret(program);
}
