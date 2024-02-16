import { Request, Response, NextFunction } from "express";

const asyncHandler = (requestHandler: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
