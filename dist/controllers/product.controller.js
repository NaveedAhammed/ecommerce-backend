import { asyncHandler } from "../utils/asyncHandler.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Billboard from "../models/billboards.model.js";
import User from "../models/user.model.js";
import ParentCategory from "../models/parentCategory.model.js";
import ChildCategory from "../models/childCategory.model.js";
import Features from "../utils/Features.js";
import { ObjectId } from "mongodb";
// GET All Products
export const getAllproducts = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
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
    return res.status(200).json(new ApiResponse(200, {
        products,
        totalProducts,
    }));
});
// GET Search Results
export const searchResults = asyncHandler(async (req, res, next) => {
    const { searchQuery } = req.query;
    const products = await Product.find({
        $or: [
            {
                title: {
                    $regex: searchQuery,
                    $options: "i",
                },
            },
            {
                brand: {
                    $regex: searchQuery,
                    $options: "i",
                },
            },
            {
                description: {
                    $regex: searchQuery,
                    $options: "i",
                },
            },
        ],
    });
    return res.status(200).json(new ApiResponse(200, {
        products,
    }));
});
// GET Filtered Products
export const filteredproducts = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const { search, parentCategoryId, childCategoryId, customerRating, brands, discount, featured, newArrivals, minPrice, maxPrice, } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;
    const features = new Features(search ? search : "", parentCategoryId ? parentCategoryId : "", childCategoryId ? childCategoryId : "", brands ? JSON.parse(brands) : [], discount ? Number(discount) : 0, JSON.parse(featured) ? Boolean(featured) : false, JSON.parse(newArrivals) ? Boolean(newArrivals) : false, JSON.parse(minPrice) ? Number(minPrice) : null, JSON.parse(maxPrice) ? Number(maxPrice) : null, customerRating ? Number(customerRating) : 0);
    const data = await features.filter(skip, limit, page);
    return res.status(200).json(new ApiResponse(200, {
        filteredProducts: data.products,
        brands: data.brands,
    }));
});
// GET Featured Products
export const featuredProducts = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
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
// GET Similar Products
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
// GET New Arrival Products
export const newArrivalProducts = asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const newArrivalProducts = await Product.find()
        .sort({ createdAt: -1 })
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
    const totalnewArrivalProducts = await Product.countDocuments();
    return res.status(200).json(new ApiResponse(200, {
        newArrivalProducts,
        totalnewArrivalProducts,
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
// GET Active Billboards
export const activeBillboards = asyncHandler(async (req, res, next) => {
    const billboards = await Billboard.find({ isActive: true }).populate("category parentCategory");
    return res.status(200).json(new ApiResponse(200, {
        billboards,
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
        .populate("unit")
        .populate({
        path: "reviews",
        populate: {
            path: "userId",
        },
    });
    if (!product) {
        return next(new ApiError(404, `No product found with this id:${id}`));
    }
    return res.status(200).json(new ApiResponse(200, {
        product,
    }));
});
// POST Create/Update Product Review
export const createOrUpdateReview = async (req, res, next) => {
    const { numRating, comment } = req.body;
    const { id } = req.params;
    const product = await Product.findById(id);
    const user = await User.findById(req.user._id);
    if (!product) {
        return next(new ApiError(404, "Product not found!"));
    }
    if (!user) {
        return next(new ApiError(404, "User not found!"));
    }
    const isReviewed = product.reviews.find((rev) => rev.userId.toString() === req.user._id.toString());
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.userId.toString() === req.user._id.toString()) {
                rev.numRating = Number(numRating);
                rev.comment = comment;
                rev.postedAt = new Date(Date.now());
            }
        });
        user.myReviews.forEach((review) => {
            if (review.productId.toString() === id.toString()) {
                review.comment = comment;
                review.numRating = Number(numRating);
                review.postedAt = new Date(Date.now());
            }
        });
    }
    else {
        const review = {
            userId: req.user._id,
            numRating: Number(numRating),
            comment,
            postedAt: new Date(Date.now()),
        };
        const myReview = {
            numRating: Number(numRating),
            comment,
            postedAt: new Date(Date.now()),
            productId: new ObjectId(id),
        };
        product.reviews.push(review);
        user.myReviews.push(myReview);
    }
    product.numRating =
        product.reviews.reduce((acc, curr) => acc + curr.numRating, 0) /
            product.reviews.length;
    await product.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
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
// GET All Parent Categories
export const allParentCategories = asyncHandler(async (req, res, next) => {
    const parentCategories = await ParentCategory.find();
    const totalParentCategories = await ParentCategory.countDocuments();
    return res.status(200).json(new ApiResponse(200, {
        parentCategories,
        totalParentCategories,
    }));
});
// GET All Child Of A Parent Category
export const allChildCategoriesOfParentCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const childCategories = await ChildCategory.find({
        parentCategory: id,
    });
    return res.status(200).json(new ApiResponse(200, {
        childCategories,
    }));
});
