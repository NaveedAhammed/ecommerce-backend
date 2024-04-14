import { Schema, Types, model } from "mongoose";
const productSchema = new Schema({
    title: {
        type: String,
        required: [true, "Product title is required"],
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
    },
    brand: {
        type: String,
        required: [true, "Brand is required"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [1, "Product price should not be negative or zero"],
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
        min: [1, "Product stock should be atleast 1"],
        max: [20, "Product stock cannot be more than 20"],
    },
    discount: {
        type: Number,
        default: 0,
    },
    color: {
        type: Types.ObjectId,
        ref: "Color",
    },
    unit: {
        type: Types.ObjectId,
        ref: "Unit",
    },
    featured: {
        type: Boolean,
        default: false,
    },
    images: [
        {
            url: {
                type: String,
            },
            id: {
                type: String,
            },
        },
    ],
    numRating: {
        type: Number,
        default: 0,
    },
    category: {
        type: Types.ObjectId,
        ref: "ChildCategory",
        required: [true, "Product category is required"],
    },
    reviews: [
        {
            userId: {
                type: Types.ObjectId,
                required: [true, "User id is required"],
                ref: "User",
            },
            numRating: {
                type: Number,
                required: [true, "User rating is required"],
                min: [1, "Min rating is 1"],
                max: [5, "Max rating is 5"],
            },
            comment: {
                type: String,
                required: [true, "Comment is required"],
            },
            postedAt: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
}, { timestamps: true });
const Product = model("Product", productSchema);
export default Product;
