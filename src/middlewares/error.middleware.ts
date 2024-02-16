import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

const error = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.statusCode).json({
    success: err.success,
    message: err.message,
    data: err.data,
    errors: err.errors,
  });
};

export { error };
