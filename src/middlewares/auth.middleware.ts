import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";

import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { IGetUserAuthInfoRequest } from "../types/request.js";
import { JwtPayload } from "../types/jwt.js";

export const isAuth = asyncHandler(
	async (req: IGetUserAuthInfoRequest, _: Response, next: NextFunction) => {
		const token: string | undefined = req
			.header("Authorization")
			?.replace("Bearer ", "");
		if (!token) {
			return next(new ApiError(401, "Anauthorized request"));
		}
		const { id } = jwt.verify(
			token,
			process.env.ACCESS_TOKEN_SECRET as string
		) as JwtPayload;
		const user = await User.findById(id);
		if (!user) {
			return next(new ApiError(401, "Invalid access token"));
		}
		req.user = user;
		next();
	}
);

export const isAdmin = (
	req: IGetUserAuthInfoRequest,
	res: Response,
	next: NextFunction
) => {
	isAuth(req, res, () => {
		if (req?.user?.role !== "admin") {
			return next(new ApiError(405, "You are not allowed"));
		}
		next();
	});
};
