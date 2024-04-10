import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import Stripe from "stripe";
import Order from "../models/order.model.js";
import { buffer } from "micro";
const STRIPE = new Stripe(process.env.STRIPE_SECRET_KEY);
// GET Checkout Session
export const checkoutSession = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const shippingAddress = req.body.selectedAddress;
    const cart = req.body.cart;
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    const orderItems = cart.map((item) => ({
        quantity: item.quantity,
        productId: item.productId,
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
        taxPrice: 0,
        shippingPrice: 0,
    });
    await order.save();
    const line_items = cart.map((item) => {
        const price = item.productId.price * (100 - (item?.productId?.discount || 0));
        const line_item = {
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
        success_url: "http://localhost:5173/checkout",
        cancel_url: "http://localhost:5173/",
    });
    if (!session?.url) {
        return next(new ApiError(500, "Error creating stripe session"));
    }
    return res.status(200).json(new ApiResponse(200, {
        url: session.url,
        sessionId: session.id,
        order,
    }));
});
export const webhook = asyncHandler(async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(await buffer(req), sig, process.env.WEBHOOK_SECRET);
    }
    catch (err) {
        console.log("Event Error:", err);
        return;
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log(session?.metadata);
    }
    res.send();
});
