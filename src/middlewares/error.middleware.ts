import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

const error = (err: any, req: Request, res: Response, next: NextFunction) => {
	console.log(err);
	if (err.message === "jwt expired") {
		return res.status(403).json(new ApiError(403, "Forbidden"));
	}
	if (err.code === 11000) {
		const message = `Duplicate "${Object.keys(err.keyValue)}" entered`;
		err = new ApiError(400, message);
	}
	return res.status(err.statusCode).json({
		success: err.success,
		message: err.message,
		data: err.data,
		errors: err.errors,
	});
};

export { error };
