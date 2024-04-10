import Order from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
// POST Create Order
export const createOrder = asyncHandler(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, } = req.body;
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
});
// POST Update Payment Status After Payment
export const paymentStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
        return next(new ApiError(404, "Order not found!"));
    }
    order.paymentInfo = req.body.status;
    order.paidAt = new Date(Date.now());
    await order.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {
        order,
    }));
});
// GET Order Details
export const orderDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
        return next(new ApiError(404, "Order not found!"));
    }
    return res.status(200).json(new ApiResponse(200, {
        order,
    }));
});
// GET My Orders
export const myOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });
    return res.status(200).json(new ApiResponse(200, {
        orders,
    }));
});
