import { IGetUserAuthInfoRequest } from "../types/request.js";
import { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import Stripe from "stripe";
import { IProduct } from "../models/product.model.js";
import Order from "../models/order.model.js";
import { ObjectId } from "mongodb";

const STRIPE = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// GET Checkout Session
export const checkoutSession = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		const user = await User.findById(req.user._id);
		const shippingAddress = req.body.deliveryAddress;
		const cart: { quantity: number; productId: IProduct }[] = req.body.cart;
		if (!user) {
			return next(new ApiError(404, "User not found!"));
		}
		const orderItems = cart.map((item) => ({
			quantity: item.quantity,
			productId: item.productId,
			price: item.productId.price,
			discount: item.productId.discount,
		}));
		const order = new Order({
			userId: req.user._id,
			shippingInfo: {
				address: shippingAddress.address,
				city: shippingAddress.city,
				locality: shippingAddress.locality,
				name: shippingAddress.name,
				phone: Number(shippingAddress.phone),
				pincode: Number(shippingAddress.pincode),
				state: shippingAddress.state,
			},
			orderItems,
			orderStatus: "processing",
			orderedAt: Date.now(),
			paymentInfo: "pending",
			shippingPrice: 0,
		});
		await order.save();
		const line_items = cart.map((item) => {
			const price =
				item.productId.price * (100 - (item?.productId?.discount || 0));
			const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
				price_data: {
					currency: "INR",
					unit_amount: price,
					product_data: {
						images: item.productId.images.map((img) => img.url),
						name: item.productId.title,
					},
				},
				quantity: Number(item.quantity),
			};
			return line_item;
		});
		const session = await STRIPE.checkout.sessions.create({
			line_items,
			metadata: {
				orderId: order._id.toString(),
				userId: req.user._id.toString(),
			},
			shipping_options: [
				{
					shipping_rate_data: {
						display_name: "Delivery",
						type: "fixed_amount",
						fixed_amount: {
							amount: 20,
							currency: "INR",
						},
					},
				},
			],
			mode: "payment",
			success_url: process.env.STRIPE_SUCCESS_URL as string,
			cancel_url: process.env.STRIPE_CANCEL_URL as string,
		});
		if (!session?.url) {
			return next(new ApiError(500, "Error creating stripe session"));
		}
		return res.status(200).json(
			new ApiResponse(200, {
				url: session.url,
				sessionId: session.id,
				order,
			})
		);
	}
);

// POST Stripe Webhook
export const webhook = asyncHandler(
	async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
		console.log("Hello here");
		let event: Stripe.Event;
		const sig = req.headers["stripe-signature"];
		try {
			event = STRIPE.webhooks.constructEvent(
				req.body,
				sig as string,
				process.env.WEBHOOK_SECRET as string
			);
		} catch (err: any) {
			console.log(err);
			return res.status(400).send(`Webhook error: ${err.message}`);
		}

		if (event.type === "checkout.session.completed") {
			const order = await Order.findById(
				new ObjectId(event.data.object.metadata?.orderId)
			);
			if (!order) {
				return next(new ApiError(404, "Order not found"));
			}
			const user = await User.findById(
				new ObjectId(event.data.object.metadata?.userId)
			);
			if (!user) {
				return next(new ApiError(500, "Something went wrong"));
			}
			order.paymentInfo = "success";
			order.paidAt = new Date(Date.now());
			await order.save({ validateBeforeSave: false });
			user.cart = [];
			await user.save({ validateBeforeSave: false });
		}

		res.status(200).send();
	}
);
