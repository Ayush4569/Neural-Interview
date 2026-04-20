export default class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    Object.setPrototypeOf(this, ErrorResponse.prototype);
    // err instanceof ErrorResponse will be false if we skip it
  }
}
 

