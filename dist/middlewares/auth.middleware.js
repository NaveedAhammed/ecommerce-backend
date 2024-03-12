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
export const isAdmin = asyncHandler(async (req, _, next) => {
    if (req?.user?.role !== "admin") {
        console.log("Hello");
        console.log(req.user);
        return next(new ApiError(405, "You are not allowed"));
    }
    next();
});
