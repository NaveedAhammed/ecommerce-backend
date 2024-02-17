import { Request, Response, NextFunction, CookieOptions } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// POST Register User
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, gender } = req.body;
    const isExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (isExistingUser) {
      return next(
        new ApiError(409, "User with email or username already exists")
      );
    }
    const user = new User({ username, email, password, gender });
    const accessToken: string = user.generateAccessToken();
    const refreshToken: string = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      return next(
        new ApiError(500, "Something went wrong while registering user")
      );
    }
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    return res
      .status(201)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            user: {
              id: user._id,
              username: user.username,
              avatar: user.avatar,
            },
            accessToken,
            refreshToken,
          },
          "Registered successfully"
        )
      );
  }
);

// POST Login User
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { usernameOrEmail, password } = req.body;
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
    const accessToken: string = user.generateAccessToken();
    const refreshToken: string = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: {
              id: user._id,
              username: user.username,
              avatar: user.avatar,
            },
            accessToken,
            refreshToken,
          },
          "Logged in successfully"
        )
      );
  }
);
