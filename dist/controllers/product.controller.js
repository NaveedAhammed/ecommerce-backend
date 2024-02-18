import { asyncHandler } from "../utils/asyncHandler.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// GET Product Details
export const productDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ApiError(404, `No product found with this id:${id}`));
    }
    return res.status(200).json(new ApiResponse(200, {
        product,
    }));
});
// POST Create/Update Product Review
export const createOrUpdateReview = async (req, res, next) => {
    const { numRating, comment, id } = req.body;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ApiError(404, "Product not found!"));
    }
    const isReviewed = product.reviews.find((rev) => rev.userId.toString() === req.user._id.toString());
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.userId.toString() === req.user._id.toString()) {
                rev.numRating = Number(numRating);
                rev.comment = comment;
            }
        });
    }
    else {
        const review = {
            userId: req.user._id,
            username: req.user.username,
            numRating: Number(numRating),
            comment,
        };
        product.reviews.push(review);
    }
    product.numRating =
        product.reviews.reduce((acc, curr) => acc + curr.numRating, 0) /
            product.reviews.length;
    await product.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Review submitted successfully!"));
};
// GET All Product Reviews
export const productReviews = async (req, res, next) => {
    const { id } = req.query;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ApiError(404, "Product not found!"));
    }
    const reviews = product.reviews;
    return res.status(200).json(new ApiResponse(200, {
        reviews,
    }));
};
// POST Delete Review
export const deleteReview = async (req, res, next) => {
    const { id } = req.query;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ApiError(404, "Product not found!"));
    }
    const newReviews = product.reviews.filter((rev) => rev.userId.toString() !== req.user._id.toString());
    product.reviews = newReviews;
    product.numRating =
        newReviews.reduce((acc, curr) => acc + curr.numRating, 0) /
            newReviews.length;
    await product.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Review deleted successfully!"));
};
