console.log("Testing increment operator"); const { tokenize } = require("./src/modules/lexer"); const { parse } = require("./src/modules/parser"); const { interpret } = require("./src/modules/interpreter"); const input = `
SUGOD
  MUGNA NUMERO a = 5
  a++
  IPAKITA: a
KATAPUSAN
`; const tokens = tokenize(input); const ast = parse(tokens); const result = interpret(ast); console.log("Result:", result);
