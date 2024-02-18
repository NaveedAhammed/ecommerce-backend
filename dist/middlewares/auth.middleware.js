import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const isAuth = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    const { id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(401, "User not found!");
    }
    req.user = user;
    next();
});
export const isAdmin = (req, res, next) => {
    isAuth(req, res, () => {
        if (req.user.role !== "admin") {
            throw new ApiError(401, "You are not authorised");
        }
        next();
    });
};
