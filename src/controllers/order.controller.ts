import { Request, Response, NextFunction } from "express";

import Order from "../models/order.model.js";
import { IGetUserAuthInfoRequest } from "../types/request.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { populate } from "dotenv";
import User from "../models/user.model.js";

// POST Create Order
export const createOrder = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const {
			shippingInfo,
			orderItems,
			paymentInfo,
			itemsPrice,
			taxPrice,
			shippingPrice,
			totalPrice,
		} = req.body;
		const order = new Order({
			shippingInfo,
			orderItems,
			paymentInfo,
			itemsPrice,
			taxPrice,
			shippingPrice,
			totalPrice,
			paidAt: Date.now(),
			user: req.user._id,
		});
		await order.save();
		return res
			.status(201)
			.json(new ApiResponse(201, {}, "Order placed successfully!"));
	}
);

// POST Update Payment Status After Payment
export const paymentStatus = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const order = await Order.findById(id);
		if (!order) {
			return next(new ApiError(404, "Order not found!"));
		}
		order.paymentInfo = req.body.status;
		order.paidAt = new Date(Date.now());
		await order.save({ validateBeforeSave: false });
		return res.status(200).json(
			new ApiResponse(200, {
				order,
			})
		);
	}
);

// GET Order Details
export const orderDetails = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const order = await Order.findById(id).populate("user", "name email");
		if (!order) {
			return next(new ApiError(404, "Order not found!"));
		}
		return res.status(200).json(
			new ApiResponse(200, {
				order,
			})
		);
	}
);

// GET My Orders
export const myOrders = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const page = Number(req.query.page) || 1;
		const limit = 10;
		const skip = (page - 1) * limit;
		const orders = await Order.find({ userId: req.user._id })
			.populate({
				path: "userId",
			})
			.populate({
				path: "orderItems",
				populate: {
					path: "productId",
					populate: {
						path: "category unit",
					},
				},
			})
			.skip(skip)
			.limit(limit);
		const totalOrders = await Order.countDocuments();
		return res.status(200).json(
			new ApiResponse(200, {
				orders,
				totalOrders,
			})
		);
	}
);

// GET Has Purchased Or Not
export const hasPurchasedOrNot = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const orders = await Order.find({
			userId: req.user._id,
			orderStatus: "delivered",
		});
		const hasPurchasedOrNot = orders.some((order) =>
			order.orderItems.some(
				(item) => item.productId.toString() === id.toString()
			)
		);
		return res.status(200).json(
			new ApiResponse(200, {
				hasPurchasedOrNot,
			})
		);
	}
);
