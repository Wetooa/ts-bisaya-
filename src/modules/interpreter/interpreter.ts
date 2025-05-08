import readlineSync from "readline-sync";
import type {
  Program,
  Statement,
  VariableDeclaration,
  AssignmentExpression,
  IfStatement,
  Expression,
  Identifier,
  NumericLiteral,
  StringLiteral,
  BooleanLiteral,
  BinaryExpression,
} from "../../types/parser.types";
import type {
  DataType,
  InputStatement,
  OutputStatement,
  ForLoop,
  CodeBlock,
  CharLiteral,
} from "../../types/parser.types";
import {
  InvalidInputLengthException,
  InvalidVariableTypeError,
} from "../../exceptions/interpreter.exceptions";

export class Interpreter {
  private variables: Map<
    string,
    { type: DataType; value: number | boolean | string | null }
  >;
  private output: string;
  private line: number;
  private program?: Program;
  private isRepl: boolean;

  constructor(isRepl: boolean) {
    this.variables = new Map();
    this.output = "";
    this.line = 0;
    this.isRepl = isRepl;
  }

  public interpret(program: Program): string {
    this.output = "";
    this.line = 0;
    this.program = program;
    this.executeStatements(this.program.body);
    return this.output;
  }

  private executeStatements(statements: Statement[]): void {
    while (this.line < statements.length) {
      this.executeStatement(statements[this.line]!);
      this.line++;
    }
  }

  private executeStatement(statement: Statement): any {
    if (!statement.type) return; // Handle empty statements

    switch (statement.type) {
      case "PROGRAM":
        return this.executeStatements((statement as Program).body);
      case "VARIABLE_DECLARATION":
        return this.executeVariableDeclaration(
          statement as VariableDeclaration,
        );
      case "ASSIGNMENT_EXPRESSION":
        return this.executeAssignmentExpression(
          statement as AssignmentExpression,
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
          `Type mismatch: cannot assign ${assignment.dataType} to ${variable.type}`,
        );
      }

      variable.value = value;
      return value;
    }

    throw new Error(`Cannot assign to non-identifier`);
  }

  private executeInputStatement(statement: InputStatement) {
    let inputValue = readlineSync.question("").split(",");
    inputValue = inputValue.map((value) => value.trim());

    if (inputValue.length < statement.variables.length) {
      throw new Error(
        `Not enough input values provided. Expected ${statement.variables.length}, got ${inputValue.length}`,
      );
    }

    for (let i = 0; i < statement.variables.length; i++) {
      const variableName = statement.variables[i]!;
      const input = inputValue[i]!;

      if (!this.variables.has(variableName)) {
        throw new Error(`Variable ${variableName} is not defined`);
      }

      const variable = this.variables.get(variableName)!;

      // Convert input based on variable type
      switch (variable.type) {
        case "NUMERO":
          if (isNaN(parseFloat(input))) {
            throw new InvalidVariableTypeError(
              "Invalid input type for datatype NUMERO",
              { line: this.line, column: 0 },
            );
          }

          variable.value = parseInt(input) || 0;
          break;
        case "TIPIK":
          if (isNaN(parseFloat(input))) {
            throw new InvalidVariableTypeError(
              "Invalid input type for datatype TIPIK",
              { line: this.line, column: 0 },
            );
          }

          variable.value = parseFloat(input) || 0.0;
          break;
        case "LETRA":
          if (input.length !== 1) {
            throw new InvalidInputLengthException(
              "Invalid input length for datatype LETRA",
              { line: this.line, column: 0 },
            );
          }

          variable.value = input[0] || "";
          break;
        case "TINUOD":
          if (input != "OO" && input != "DILI") {
            throw new InvalidVariableTypeError(
              "Invalid input length for datatype TINUOD",
              { line: this.line, column: 0 },
            );
          }

          variable.value = input === "OO";
          break;
        default:
          variable.value = input;
      }
    }
  }

  private executeOutputStatement(statement: OutputStatement): void {
    for (const variable of statement.variables) {
      let value = this.evaluateExpression(variable);

      value = value === true ? "OO" : value === false ? "DILI" : value;

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
          expression as AssignmentExpression,
        );

      case "NULL_LITERAL":
        return this.getDefaultValueForType("NULL");

      default:
        throw new Error(
          `Exception line ${this.program!.body[this.line]} >>> Unknown expression type: ${expression.type}`,
        );
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
