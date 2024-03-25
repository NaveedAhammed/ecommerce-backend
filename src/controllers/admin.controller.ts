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
import Unit from "../models/unit.model.js";
import Color from "../models/color.model.js";
import ChildCategory from "../models/childCategory.model.js";
import Billboard from "../models/billboards.model.js";
import ParentCategory from "../models/parentCategory.model.js";

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

// GET All Child Categories
export const allChildCategories = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const childCategories = await ChildCategory.find().populate(
			"parentCategory"
		);
		const totalChildCategories = await ChildCategory.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				childCategories,
				totalChildCategories,
			})
		);
	}
);

// GET All Parent Categories
export const allParentCategories = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const parentCategories = await ParentCategory.find();
		const totalParentCategories = await ParentCategory.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				parentCategories,
				totalParentCategories,
			})
		);
	}
);

// GET All Billboards
export const allBillboards = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const billboards = await Billboard.find().populate("category");
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
		const units = await Unit.find();
		const totalUnits = await Unit.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				units,
				totalUnits,
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
			.populate({
				path: "category",
				populate: {
					path: "parentCategory",
				},
			})
			.populate("color")
			.populate("unit")
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
			price,
			stock,
			childCategoryId,
			colorId,
			unitId,
			discount,
			description,
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
			description,
			price,
			category: childCategoryId,
			color: colorId ? colorId : null,
			discount: discount ? discount : 0,
			unit: unitId ? unitId : null,
			stock,
			featured: req.body.featured === "on" ? true : false,
			images: imagesLinks,
		});
		await product.save();
		const newProduct = await Product.findById(product._id)
			.populate({
				path: "category",
				populate: {
					path: "parentCategory",
				},
			})
			.populate("color")
			.populate("unit");
		const totalProducts = await Product.countDocuments();
		return res
			.status(201)
			.json(
				new ApiResponse(
					200,
					{ product: newProduct, totalProducts },
					"Created new product successfully"
				)
			);
	}
);

// POST Create Unit
export const createUnit = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { name, value, shortHand } = req.body;
		if (!name || !value) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const unit = new Unit({
			name,
			value,
			shortHand: shortHand ? shortHand : null,
		});
		await unit.save();
		return res
			.status(201)
			.json(
				new ApiResponse(200, { unit }, "Created new unit successfully")
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

// POST Create Child Category
export const createChildCategory = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { parentCategoryId, name } = req.body;
		console.log(req.body);
		if (!parentCategoryId || !name) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const childCategory = new ChildCategory({
			parentCategory: parentCategoryId,
			name,
		});
		await childCategory.save();
		const newChildCategory = await ChildCategory.findById(
			childCategory._id
		).populate("parentCategory", "name");
		return res
			.status(201)
			.json(
				new ApiResponse(
					200,
					{ childCategory: newChildCategory },
					"Created new child category successfully"
				)
			);
	}
);

// POST Create Parent Category
export const createParentCategory = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { name } = req.body;
		console.log(req.body);
		if (!name) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const parentCategory = new ParentCategory({
			name,
		});
		await parentCategory.save();
		return res
			.status(201)
			.json(
				new ApiResponse(
					200,
					{ parentCategory },
					"Created new parent category successfully"
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
			childCategoryId,
			colorId,
			unitId,
			featured,
		} = req.body;
		console.log(req.body, req.file);
		const images = req.files as Express.Multer.File[];
		const product = await Product.findById(id);
		const prevImages = product?.images;
		if (!product) {
			return next(
				new ApiError(500, `No product found with this id:${id}`)
			);
		}
		if (product.images.length === 0 && images.length === 0) {
			return next(new ApiError(400, "Atleast 1 image is required"));
		}
		if (product.images.length + images.length > 4) {
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
				discount: discount ? discount : 0,
				stock,
				color: colorId ? colorId : null,
				unit: unitId ? unitId : null,
				category: childCategoryId ? childCategoryId : null,
				featured: featured === "on" ? true : false,
				images: imagesLinks,
			},
			{
				new: true,
			}
		)
			.populate({
				path: "category",
				populate: {
					path: "parentCategory",
				},
			})
			.populate("color")
			.populate("unit");
		const totalProducts = await Product.countDocuments();
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ product: updatedProduct, totalProducts },
					"Product updated successfully."
				)
			);
	}
);

// UPDATE Child Category
export const updateChildCategory = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { name, parentCategoryId } = req.body;
		if (!name || !parentCategoryId) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const childCategory = await ChildCategory.findById(id);
		if (!childCategory) {
			return next(
				new ApiError(500, `No child category found with this id:${id}`)
			);
		}
		const updatedChildCategory = await ChildCategory.findByIdAndUpdate(
			id,
			{ name, parentCategory: parentCategoryId },
			{
				new: true,
			}
		).populate("parentCategory", "name");
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ childCategory: updatedChildCategory },
					"Child category updated successfully."
				)
			);
	}
);

// UPDATE Parent Category
export const updateParentCategory = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { name } = req.body;
		if (!name) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const parentCategory = await ParentCategory.findById(id);
		if (!parentCategory) {
			return next(
				new ApiError(500, `No parent category found with this id:${id}`)
			);
		}
		const updatedParentCategory = await ParentCategory.findByIdAndUpdate(
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
					{ category: updatedParentCategory },
					"Parent category updated successfully."
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

// UPDATE Unit
export const updateUnit = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const { name, value, shortHand } = req.body;
		if (!name || !value) {
			return next(new ApiError(402, "Please enter valid inputs"));
		}
		const unit = await Unit.findById(id);
		if (!unit) {
			return next(new ApiError(500, `No unit found with this id:${id}`));
		}
		const updatedUnit = await Unit.findByIdAndUpdate(
			id,
			{ name, value, shortHand: shortHand ? shortHand : null },
			{
				new: true,
			}
		);
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ unit: updatedUnit },
					"Unit updated successfully."
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

// POST Delete Child Category
export const deleteChildCategory = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const childCategory = await ChildCategory.findById(id);
		if (!childCategory) {
			return next(
				new ApiError(500, `No child category found with this id:${id}`)
			);
		}
		await childCategory.deleteOne();
		return res
			.status(200)
			.json(
				new ApiResponse(200, {}, "Child category deleted successfully!")
			);
	}
);

// POST Delete Parent Category
export const deleteParentCategory = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const parentCategory = await ParentCategory.findById(id);
		if (!parentCategory) {
			return next(
				new ApiError(500, `No parent category found with this id:${id}`)
			);
		}
		await parentCategory.deleteOne();
		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{},
					"Parent category deleted successfully!"
				)
			);
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

// POST Delete Unit
export const deleteUnit = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const unit = await Unit.findById(id);
		if (!unit) {
			return next(new ApiError(500, `No unit found with this id:${id}`));
		}
		await unit.deleteOne();
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Unit deleted successfully!"));
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
