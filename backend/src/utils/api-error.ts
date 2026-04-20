/** App-specific error with an HTTP status code. */
export class ApiError extends Error {
  statusCode: number;

  /** Creates an API error for middleware handling. */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
