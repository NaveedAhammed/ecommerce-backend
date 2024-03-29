import crypto from "crypto";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Types } from "mongoose";
// POST Register User
export const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return next(new ApiError(402, "Please enter valid inputs"));
    }
    const isExistingUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (isExistingUser) {
        return next(new ApiError(409, "User with email or username already exists"));
    }
    const user = new User({ username, email, password });
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        return next(new ApiError(500, "Something went wrong while registering user"));
    }
    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    return res
        .status(201)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(201, {
        user: {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            wishlisdIds: user.wishlistIds,
        },
        accessToken,
    }, "Registered successfully"));
});
// POST Login User
export const loginUser = asyncHandler(async (req, res, next) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        return next(new ApiError(402, "Please enter valid inputs"));
    }
    const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user) {
        return next(new ApiError(404, "User does not exist"));
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        return next(new ApiError(401, "Invaild user credentials"));
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
        user: {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            wishlistIds: user.wishlistIds,
        },
        accessToken,
    }, "Logged in successfully"));
});
// POST Logout User
export const logoutUser = asyncHandler(async (req, res, _) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1,
        },
    }, { new: true });
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});
// POST Forgot Password
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError(404, `User not found with this email:${email}`));
    }
    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
    const message = `Your password reset link is : \n\n${resetPasswordUrl} \n\nIf you have not requested this email, please ignore it.`;
    try {
        await sendEmail({
            email: user.email,
            subject: "Account Password Recovery",
            message,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, {}, `Email sent to ${user.email} successfully`));
    }
    catch (error) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save({ validateBeforeSave: false });
    }
});
// POST Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ApiError(400, "Reset password token has expired"));
    }
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    user.password = password;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successful you can login"));
});
// GET My Profile
export const myProfile = asyncHandler(async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    return res.status(200).json(new ApiResponse(200, {
        user: {
            username: user.username,
            email: user.email,
            avatar: user?.avatar,
            phone: user?.phone,
        },
    }));
});
// POST Update My Profile
export const updateMyProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
    });
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    return res.status(200).json(new ApiResponse(200, {
        user: {
            username: user.username,
            avatar: user?.avatar,
            email: user.email,
            phone: user?.phone,
        },
    }));
});
// POST Upload Profile Picture
export const uploadProfilePicture = asyncHandler(async (req, res, next) => {
    console.log(JSON.parse(req.body));
    const avatarLocalPath = req.body.avatar;
    if (!avatarLocalPath) {
        return next(new ApiError(400, "Avatar file is missing"));
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar?.url,
        },
    }, { new: true }).select("-password -refreshToken");
    res.status(200).json(new ApiResponse(200, {
        user: {
            username: user?.username,
            avatar: user?.avatar,
            email: user?.email,
            phone: user?.phone,
        },
    }));
});
// GET Refresh
export const refresh = asyncHandler(async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res
            .status(401)
            .json(new ApiError(401, "Unauthorized request"));
    }
    const refreshToken = cookies.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        return next(new ApiError(401, "Invalid refresh token"));
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log("Hello");
            return next(new ApiError(401, "Refresh token has been expired"));
        }
        const accessToken = jwt.sign({ id: user._id, username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        console.log(user);
        return res.status(200).json(new ApiResponse(200, {
            user: {
                username: user.username,
                avatar: user?.avatar,
                id: user._id,
                wishlistIds: user?.wishlistIds,
            },
            accessToken,
        }));
    });
});
// POST Add or Remove Wishlist Id
export const addorRemoveWishlistId = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    const isExistingItem = user.wishlistIds.findIndex((item) => item.toString() === productId);
    if (isExistingItem !== -1) {
        user.wishlistIds.splice(isExistingItem, 1);
    }
    else {
        user.wishlistIds.push(new Types.ObjectId(productId));
    }
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, `Product ${isExistingItem !== -1 ? "removed from" : "added to"} wishlist`));
});
