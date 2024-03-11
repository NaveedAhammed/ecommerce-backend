import { Request, Response, NextFunction, CookieOptions } from "express";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Product, { ImageType } from "../models/product.model.js";
import Order from "../models/order.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { IGetUserAuthInfoRequest } from "../types/request.js";
import Size from "../models/size.model.js";
import Color from "../models/color.model.js";
import Category from "../models/category.model.js";

// POST Admin Login
export const adminLogin = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { usernameOrEmail, password } = req.body;
		if (!usernameOrEmail || !password) {
			return next(new ApiError(400, "Please enter valid credentials"));
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
		if (user.role !== "admin") {
			return next(new ApiError(401, "You are not allowed to login"));
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
					},
					"Logged in successfully"
				)
			);
	}
);

// GET All Users
export const allUsers = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const users = await User.find();
		return res.status(200).json(
			new ApiResponse(200, {
				users,
			})
		);
	}
);

// GET All Categories
export const allCategories = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const categories = await Category.find();
		return res.status(200).json(
			new ApiResponse(200, {
				categories,
			})
		);
	}
);

// GET All Sizes
export const allSizes = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const sizes = await Size.find();
		return res.status(200).json(
			new ApiResponse(200, {
				sizes,
			})
		);
	}
);

// GET All Colors
export const allColors = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const colors = await Color.find();
		return res.status(200).json(
			new ApiResponse(200, {
				colors,
			})
		);
	}
);

// GET All Products
export const allProducts = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const page = Number(req.query.page) || 1;
		const limit = 2;
		const skip = (page - 1) * limit;
		const products = await Product.find()
			.populate("category", "name")
			.populate("color", "name value")
			.populate("size", "name value")
			.limit(limit)
			.skip(skip);
		return res.status(200).json(
			new ApiResponse(200, {
				products,
			})
		);
	}
);

// GET Single User
export const singleUser = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
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
export const updateUserRole = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
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
	}
);

// POST Delete User
export const deleteUser = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
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

// POST Create Product
export const createProduct = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const {
			title,
			description,
			price,
			stock,
			discount,
			category,
			color,
			size,
			featured,
		} = req.body;
		const images = req.files as Express.Multer.File[];
		console.log(req.files);
		console.log(req.body);
		if (images.length === 0) {
			return next(new ApiError(400, "Please add atleast one image"));
		}
		const imagesLinks: ImageType[] = [];

		for (let i = 0; i < images.length; i++) {
			const result = await uploadOnCloudinary(images[i].path);
			if (result?.secure_url) {
				imagesLinks.push({
					url: result?.secure_url,
					id: result?.public_id,
				});
			}
		}
		const product = new Product({
			title,
			price,
			description,
			category,
			stock,
			discount,
			images: imagesLinks,
			color,
			size,
			featured: featured === "on" ? true : false,
		});
		await product.save();
		return res
			.status(201)
			.json(new ApiResponse(200, {}, "Created new product successfully"));
	}
);

// POST Create Size
export const createSize = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { name, value } = req.body;
		if (!name || !value) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const size = new Size({
			name,
			value,
		});
		await size.save();
		return res
			.status(201)
			.json(
				new ApiResponse(200, { size }, "Created new size successfully")
			);
	}
);

// POST Create Color
export const createColor = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { name, value } = req.body;
		if (!name || !value) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const color = new Color({
			name,
			value,
		});
		await color.save();
		return res
			.status(201)
			.json(new ApiResponse(200, {}, "Created new color successfully"));
	}
);

// POST Create Category
export const createCategory = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { name } = req.body;
		console.log(req.body);
		if (!name) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const category = new Category({ name });
		await category.save();
		return res
			.status(201)
			.json(
				new ApiResponse(200, {}, "Created new category successfully")
			);
	}
);

// POST Update Product
export const updateProduct = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const product = await Product.findById(id);
		if (!product) {
			return next(
				new ApiError(500, `No product found with this id:${id}`)
			);
		}
		const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ product: updatedProduct },
					"Product updated successfully."
				)
			);
	}
);

// POST Update Category
export const updateCategory = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const category = await Category.findById(id);
		if (!category) {
			return next(
				new ApiError(500, `No category found with this id:${id}`)
			);
		}
		const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ category: updatedCategory },
					"Product updated successfully."
				)
			);
	}
);

// POST Update Category
export const updateColor = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const color = await Color.findById(id);
		if (!color) {
			return next(new ApiError(500, `No color found with this id:${id}`));
		}
		const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ color: updatedColor },
					"Color updated successfully."
				)
			);
	}
);

// POST Update Category
export const updateSize = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const size = await Size.findById(id);
		if (!size) {
			return next(new ApiError(500, `No size found with this id:${id}`));
		}
		const updatedSize = await Size.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ size: updatedSize },
					"Size updated successfully."
				)
			);
	}
);

// POST Delete Product
export const deleteProduct = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const product = await Product.findById(id);
		if (!product) {
			return next(
				new ApiError(500, `No product found with this id:${id}`)
			);
		}
		await product.deleteOne();
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Product deleted successfully!"));
	}
);

// POST Delete Category
export const deleteCategory = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const category = await Category.findById(id);
		if (!category) {
			return next(
				new ApiError(500, `No category found with this id:${id}`)
			);
		}
		await category.deleteOne();
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Category deleted successfully!"));
	}
);

// POST Delete Color
export const deleteColor = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const color = await Color.findById(id);
		if (!color) {
			return next(new ApiError(500, `No color found with this id:${id}`));
		}
		await color.deleteOne();
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Color deleted successfully!"));
	}
);

// POST Delete Size
export const deleteSize = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const size = await Size.findById(id);
		if (!size) {
			return next(new ApiError(500, `No size found with this id:${id}`));
		}
		await size.deleteOne();
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Size deleted successfully!"));
	}
);

// GET All Orders
export const allOrders = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const orders = await Order.find();
		return res.status(200).json(
			new ApiResponse(200, {
				orders,
			})
		);
	}
);

// POST Update Order Status
export const updateOrderStatus = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const order = await Order.findById(id);
		if (!order) {
			return next(new ApiError(404, "Order not found!"));
		}
		// order.orderItems.forEach((item) => {
		//   updateStock()
		// })
	}
);

// POST Delete Order
export const deleteOrder = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const order = await Order.findById(id);
		if (!order) {
			return next(new ApiError(404, "Order not found!"));
		}
		await order.deleteOne();
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Order deleted successfully"));
	}
);

// GET Refresh
export const refresh = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
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
		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET as string,
			(err: any, decoded: any) => {
				if (err) {
					console.log("Hello");
					return next(
						new ApiError(401, "Refresh token has been expired")
					);
				}
				const accessToken = jwt.sign(
					{ id: user._id, username: decoded.username },
					process.env.ACCESS_TOKEN_SECRET as string,
					{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
				);
				return res.status(200).json(
					new ApiResponse(200, {
						user: {
							username: user.username,
							avatar: user?.avatar,
							id: user._id,
						},
						accessToken,
					})
				);
			}
		);
	}
);
