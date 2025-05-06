import interpret from "../../consts/interpreter/interpreter";

try {
  interpret("');
} catch (Error) {
  console.log(Error);
}

// console.log(Number.isInteger(1.5));
