import { ObjectId } from "mongodb";
import ChildCategory from "../models/childCategory.model.js";
import Product from "../models/product.model.js";
class Features {
    constructor(search, parentCategoryId, childCategoryId, brands, discount, featured, newArrivals, minPrice, maxPrice, customerRating, sortBy) {
        this.searchQuery = search;
        this.parentCategoryId = parentCategoryId;
        this.childCategoryId = childCategoryId;
        this.brands = brands;
        this.discount = discount;
        this.featured = featured;
        this.newArrivals = newArrivals;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.customerRating = customerRating;
        this.sortBy = sortBy;
    }
    async filter(skip, limit, page) {
        let childCategoriesIds = [];
        let products = [];
        let totalProducts = 0;
        if (this.parentCategoryId) {
            const childCategories = await ChildCategory.find({
                parentCategory: new ObjectId(this.parentCategoryId),
            });
            childCategoriesIds = childCategories.map((it) => it._id);
        }
        let query = {};
        let sortQuery = {};
        if (this.sortBy === "1") {
            sortQuery["price"] = 1;
        }
        else if (this.sortBy === "2") {
            sortQuery["price"] = -1;
        }
        else if (this.sortBy === "3") {
            sortQuery["numRating"] = 1;
        }
        else if (this.sortBy === "4") {
            sortQuery["numRating"] = -1;
        }
        else if (this.sortBy === "5") {
            sortQuery["createdAt"] = -1;
        }
        console.log(this.sortBy, sortQuery);
        if (this.searchQuery) {
            query["title"] = {
                $regex: this.searchQuery,
                $options: "i",
            };
        }
        if (this.childCategoryId) {
            query["category"] = new ObjectId(this.childCategoryId);
        }
        if (this.discount > 0) {
            query["discount"] = { $gte: this.discount };
        }
        if (this.featured) {
            query["featured"] = this.featured;
        }
        console.log(this.minPrice, this.maxPrice);
        if (this.maxPrice && this.minPrice) {
            query["price"] = { $gte: this.minPrice, $lte: this.maxPrice };
        }
        else if (this.minPrice && !this.maxPrice) {
            query["price"] = { $gte: this.minPrice };
        }
        else if (!this.minPrice && this.maxPrice) {
            query["price"] = { $lte: this.maxPrice };
        }
        if (this.customerRating > 0) {
            query["numRating"] = { $gte: this.customerRating };
        }
        if (childCategoriesIds.length === 0) {
            totalProducts = await Product.find({ ...query }).countDocuments();
            products = await Product.find({ ...query })
                .sort(sortQuery)
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
        }
        else {
            totalProducts = await Product.find({
                category: { $in: childCategoriesIds },
                ...query,
            }).countDocuments();
            products = await Product.find({
                category: { $in: childCategoriesIds },
                ...query,
            })
                .sort(sortQuery)
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
        }
        const brands = products.map((it) => it.brand);
        const uniqueBrands = brands.filter((it, index) => {
            return brands.indexOf(it) === index;
        });
        if (this.brands === null) {
            return { products, brands: uniqueBrands, totalProducts };
        }
        else {
            totalProducts = await Product.find({
                brand: { $in: brands },
            }).countDocuments();
            return {
                products: products.filter((it) => this.brands.includes(it.brand)),
                brands: uniqueBrands,
                totalProducts,
            };
        }
    }
}
export default Features;
