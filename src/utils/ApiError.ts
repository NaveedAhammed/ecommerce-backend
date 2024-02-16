class ApiError extends Error {
  statusCode: number;
  message: string;
  data?: object;
  success: boolean;
  errors?: object;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors?: object
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = undefined;
    this.success = false;
    this.errors = errors;
  }
}

export { ApiError };
