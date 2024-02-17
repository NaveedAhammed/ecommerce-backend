import { Request, Response, NextFunction } from "express";

import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// GET All Users
export const allUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();
    return res.status(200).json(
      new ApiResponse(200, {
        users,
      })
    );
  }
);

// GET Single User
export const singleUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new ApiError(400, `No user found with this id:${id}`));
    }
    return res.status(200).json(
      new ApiResponse(200, {
        user,
      })
    );
  }
);

// POST Update User Role
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(400, `No user found with this id:${id}`));
  }
  user.role = role;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User role updated successfully"));
});

// POST Delete User
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new ApiError(400, `No user found with this id:${id}`));
    }
    await user.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User deleted successfully!"));
  }
);
