import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const isAuth = asyncHandler(async (req, _, next) => {
    const token = req
        .header("Authorization")
        ?.replace("Bearer ", "");
    if (!token) {
        return next(new ApiError(401, "Anauthorized request"));
    }
    const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(id);
    if (!user) {
        return next(new ApiError(401, "Invalid access token"));
    }
    req.user = user;
    next();
});
export const isAdmin = (req, res, next) => {
    isAuth(req, res, () => {
        if (req?.user?.role !== "admin") {
            return next(new ApiError(403, "You are not authorised"));
        }
        next();
    });
};
