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
import Billboard from "../models/billboards.model.js";

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

// GET All Orders
export const allOrders = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const page = Number(req.query.page) || 1;
		const limit = 2;
		const skip = (page - 1) * limit;
		const orders = await Order.find().skip(skip).limit(limit);
		const totalOrders = await Order.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				orders,
				totalOrders,
			})
		);
	}
);

// GET All Users
export const allUsers = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const users = await User.find();
		const totalUsers = await User.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				users,
				totalUsers,
			})
		);
	}
);

// GET All Categories
export const allCategories = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const categories = await Category.find();
		const totalCategories = await Category.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				categories,
				totalCategories,
			})
		);
	}
);

// GET All Billboards
export const allBillboards = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const billboards = await Billboard.find().populate("category", "name");
		const totalBillboards = await Billboard.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				billboards,
				totalBillboards,
			})
		);
	}
);

// GET All Sizes
export const allSizes = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const sizes = await Size.find();
		const totalSizes = await Size.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				sizes,
				totalSizes,
			})
		);
	}
);

// GET All Colors
export const allColors = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const colors = await Color.find();
		const totalColors = await Color.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				colors,
				totalColors,
			})
		);
	}
);

// GET All Products
export const allProducts = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const page = Number(req.query.page) || 1;
		const limit = 5;
		const skip = (page - 1) * limit;
		const products = await Product.find()
			.populate("category", "name")
			.populate("color", "name value")
			.populate("size", "name value")
			.limit(limit)
			.skip(skip);
		const totalProducts = await Product.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				products,
				totalProducts,
				productsPerPage: limit,
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
		if (images.length === 0) {
			return next(new ApiError(400, "Atleast 1 image is required"));
		}
		if (images.length > 4) {
			return next(new ApiError(400, "Atmost 4 images only"));
		}
		const imagesLinks: ImageType[] = [];

		for (let i = 0; i < images.length; i++) {
			const result = await uploadOnCloudinary(images[i].path);
			if (result?.secure_url) {
				imagesLinks.push({
					url: result?.secure_url,
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
			.json(
				new ApiResponse(
					200,
					{ color },
					"Created new color successfully"
				)
			);
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
				new ApiResponse(
					200,
					{ category },
					"Created new category successfully"
				)
			);
	}
);

// POST Create Billboard
export const createBillboard = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { title, categoryId } = req.body;
		const image = req.file;
		if (!title || !categoryId) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		if (!image) {
			return next(
				new ApiError(402, "Please give an image for billboard")
			);
		}
		const result = await uploadOnCloudinary(image?.path);
		const billboard = new Billboard({
			title,
			category: categoryId,
			imageUrl: result?.secure_url,
		});
		await billboard.save();
		const newBillboard = await Billboard.findById(billboard._id).populate(
			"category"
		);
		return res
			.status(201)
			.json(
				new ApiResponse(
					200,
					{ billboard: newBillboard },
					"Created new billboard successfully"
				)
			);
	}
);

// UPDATE User Role
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

// UPDATE Product
export const updateProduct = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
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
			prevImagesLen,
		} = req.body;
		const images = req.files as Express.Multer.File[];
		console.log(req.body);
		console.log(req.files);
		const product = await Product.findById(id);
		const prevImages = product?.images;
		console.log(product);
		console.log(prevImages);
		if (!product) {
			return next(
				new ApiError(500, `No product found with this id:${id}`)
			);
		}
		if (Number(prevImagesLen) === 0 && images.length === 0) {
			return next(new ApiError(400, "Atleast 1 image is required"));
		}
		if (Number(prevImagesLen) + images.length > 4) {
			return next(new ApiError(400, "Atmost 4 image only"));
		}
		const imagesLinks: ImageType[] = [];
		if (images.length > 0) {
			for (let i = 0; i < images.length; i++) {
				const result = await uploadOnCloudinary(images[i].path);
				if (result?.secure_url) {
					imagesLinks.push({
						url: result?.secure_url,
					});
				}
			}
		}
		if (prevImages?.length && prevImages.length > 0) {
			prevImages.forEach((img) => {
				imagesLinks.push({
					url: img.url,
				});
			});
		}
		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			{
				title,
				description,
				price,
				discount,
				stock,
				color,
				size,
				category,
				featured: featured === "on" ? true : false,
				images: imagesLinks,
			},
			{
				new: true,
			}
		)
			.populate("category", "name")
			.populate("color", "name value")
			.populate("size", "name value");
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

// UPDATE Category
export const updateCategory = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { name } = req.body;
		if (!name) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const category = await Category.findById(id);
		if (!category) {
			return next(
				new ApiError(500, `No category found with this id:${id}`)
			);
		}
		const updatedCategory = await Category.findByIdAndUpdate(
			id,
			{ name },
			{
				new: true,
			}
		);
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ category: updatedCategory },
					"Category updated successfully."
				)
			);
	}
);

// UPDATE Color
export const updateColor = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { name, value } = req.body;
		if (!name || !value) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const color = await Color.findById(id);
		if (!color) {
			return next(new ApiError(500, `No color found with this id:${id}`));
		}
		const updatedColor = await Color.findByIdAndUpdate(
			id,
			{ name, value },
			{
				new: true,
			}
		);
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

// UPDATE Size
export const updateSize = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { name, value } = req.body;
		if (!name || !value) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const size = await Size.findById(id);
		if (!size) {
			return next(new ApiError(500, `No size found with this id:${id}`));
		}
		const updatedSize = await Size.findByIdAndUpdate(
			id,
			{ name, value },
			{
				new: true,
			}
		);
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

// UPDATE Billboard
export const updateBillboard = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { title, categoryId, imageUrl } = req.body;
		const image = req?.file;
		console.log(title, categoryId, image, imageUrl);
		if (!title || !categoryId) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		if (!image && !imageUrl) {
			return next(new ApiError(402, "Please give an image to billboard"));
		}
		const billboard = await Billboard.findById(id);
		if (!billboard) {
			return next(
				new ApiError(500, `No billboard found with this id:${id}`)
			);
		}
		let result;
		if (image) {
			result = await uploadOnCloudinary(image?.path);
		}
		const updatedBillboard = await Billboard.findByIdAndUpdate(
			id,
			{
				title,
				category: categoryId,
				imageUrl: result ? result.secure_url : imageUrl,
			},
			{
				new: true,
			}
		).populate("category", "name");
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ billboard: updatedBillboard },
					"Billboard updated successfully."
				)
			);
	}
);

// DELETE User
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

// DELETE Product
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

// UPDATE Order Status
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

// DELETE Product Image
export const deleteProductImage = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { imageId } = req.query;
		const product = await Product.findById(id);
		if (!product) {
			return next(new ApiError(404, "Product not found!"));
		}
		await Product.updateOne(
			{ _id: id },
			{
				$pull: {
					images: {
						_id: imageId,
					},
				},
			}
		);
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Image deleted successfully"));
	}
);

// DELETE Order
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
