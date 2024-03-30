import { asyncHandler } from "../utils/asyncHandler.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Billboard from "../models/billboards.model.js";
import User from "../models/user.model.js";
export const getAllproducts = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const featuredProducts = await Product.find()
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
    const totalFeaturedProducts = await Product.countDocuments();
    return res.status(200).json(new ApiResponse(200, {
        featuredProducts,
        totalFeaturedProducts,
    }));
});
// GET Featured Products
export const featuredProducts = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const featuredProducts = await Product.find({ featured: true })
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
    const totalFeaturedProducts = await Product.countDocuments();
    return res.status(200).json(new ApiResponse(200, {
        featuredProducts,
        totalFeaturedProducts,
    }));
});
// GET Featured Products
export const similarProducts = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    const { productId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const similarProducts = await Product.find({
        category: categoryId,
        _id: { $ne: productId },
    })
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
    const totalSimilarProducts = await Product.countDocuments();
    return res.status(200).json(new ApiResponse(200, {
        similarProducts,
        totalSimilarProducts,
    }));
});
// GET Wishlist Products
export const wishlistProducts = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    await user.populate({
        path: "wishlistIds",
        populate: {
            path: "category unit color",
        },
    });
    return res.status(200).json(new ApiResponse(200, {
        wishlistProducts: user.wishlistIds,
        totalWishlistProducts: user.wishlistIds.length,
    }));
});
// GET Cart Products
export const cartProducts = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    await user.populate({
        path: "cart",
        populate: {
            path: "productId",
            populate: {
                path: "category unit color",
            },
        },
    });
    return res.status(200).json(new ApiResponse(200, {
        cart: user.cart,
        totalCartProducts: user.cart.length,
    }));
});
// GET Active Billboard
export const activeBillboard = asyncHandler(async (req, res, next) => {
    const billboard = await Billboard.find({ isActive: true });
    return res.status(200).json(new ApiResponse(200, {
        billboard,
    }));
});
// GET Product Details
export const productDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id)
        .populate({
        path: "category",
        populate: {
            path: "parentCategory",
        },
    })
        .populate("color")
        .populate("unit");
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
