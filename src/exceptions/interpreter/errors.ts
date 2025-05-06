export class InvalidDataType extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDataType"; // Set the error name
    Object.setPrototypeOf(this, InvalidDataType.prototype); // Fix prototype chain
  }
}
