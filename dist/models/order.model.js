import mongoose from "mongoose";
const { Schema, model } = mongoose;
const orderSchema = new Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        city: {
            type: String,
            required: [true, "City is required"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
        },
        pincode: {
            type: Number,
            required: [true, "Pincode is required"],
        },
        phone: {
            type: Number,
            required: [true, "Phone number is required"],
        },
    },
    orderItems: [
        {
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
            },
            productId: {
                type: Schema.ObjectId,
                required: [true, "Product id is required"],
                ref: "Product",
            },
            price: {
                type: Number,
                required: [true, "Product price is required"],
            },
            discount: {
                type: Number,
                required: [true, "Product discount is required"],
            },
        },
    ],
    userId: {
        type: Schema.ObjectId,
        required: [true, "User id is required"],
        ref: "User",
    },
    paymentInfo: {
        type: String,
        enum: {
            values: ["pending", "success", "failed"],
            message: "{VALUE} is not supported",
        },
    },
    paidAt: {
        type: Date,
    },
    shippingPrice: {
        type: Number,
        required: [true, "Shipping price is required"],
    },
    orderStatus: {
        type: String,
        required: [true, "Order status is required"],
        enum: {
            values: ["processing", "shipped", "delivered"],
            message: "{VALUE} is not supported",
        },
        default: "processing",
    },
    orderedAt: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    deliveredAt: Date,
});
const Order = model("Order", orderSchema);
export default Order;
