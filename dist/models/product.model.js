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
    images: {
        type: [String],
        required: [true, "Product images are required"],
        minlength: [1, "Atleast 1 image is required"],
        maxlength: [5, "Atmost 5 images can be uploaded"],
    },
    numRating: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: [true, "Product category is required"],
        lowercase: true,
    },
    reviews: [
        {
            userId: {
                type: Types.ObjectId,
                required: [true, "User id is required"],
                ref: "User",
            },
            username: {
                type: String,
                required: [true, "Username is required"],
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
        },
    ],
}, { timestamps: true });
const Product = model("Product", productSchema);
export default Product;
