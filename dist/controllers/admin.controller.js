import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Product from "../models/product.model.js";
// GET All Users
export const allUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    return res.status(200).json(new ApiResponse(200, {
        users,
    }));
});
// GET Single User
export const singleUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return next(new ApiError(400, `No user found with this id:${id}`));
    }
    return res.status(200).json(new ApiResponse(200, {
        user,
    }));
});
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
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return next(new ApiError(400, `No user found with this id:${id}`));
    }
    await user.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User deleted successfully!"));
});
// POST Create Product
export const createProduct = asyncHandler(async (req, res, next) => {
    const product = new Product(req.body);
    await product.save();
    return res.status(201).json(new ApiResponse(200, {
        product,
    }, "Created new product successfully"));
});
// POST Update Product
export const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ApiError(500, `No product found with this id:${id}`));
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, { updateProduct }, "Product updated successfully."));
});
// POST Delete Product
export const deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ApiError(500, `No product found with this id:${id}`));
    }
    await product.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Product deleted successfully!"));
});
