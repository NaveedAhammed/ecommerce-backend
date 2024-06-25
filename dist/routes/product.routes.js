import { Router } from "express";
import { activeBillboards, allChildCategoriesOfParentCategory, allParentCategories, createOrUpdateReview, deleteReview, featuredProducts, filteredproducts, getAllproducts, newArrivalProducts, productDetails, productReviews, searchResults, similarProducts, wishlistProducts, } from "../controllers/product.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
const router = Router();
// <---------- GET REQUEST ---------->
// GET all products
router.route("/products").get(getAllproducts);
// GET all filltered products
router.route("/filteredProducts").get(filteredproducts);
// GET featured products
router.route("/products/featured").get(featuredProducts);
// GET new arrivals products
router.route("/products/newArrivals").get(newArrivalProducts);
// GET similar product
router.route("/products/similar/:categoryId").get(similarProducts);
// GET wishlist products
router.route("/products/wishlist").get(isAuth, wishlistProducts);
// GET product details
router.route("/products/:id").get(productDetails);
// GET product reviews
router.route("/product/reviews/:id").get(productReviews);
// GET active billboard
router.route("/billboards/active").get(activeBillboards);
// GET all parent categories
router.route("/category/parent/public").get(allParentCategories);
// GET all child categories of a parent category
router
    .route("/category/child/public/:id")
    .get(allChildCategoriesOfParentCategory);
// GET search suggetions
router.route("/search").get(searchResults);
// <---------- POST REQUEST ---------->
// POST create/update product review
router.route("/product/review/:id").post(isAuth, createOrUpdateReview);
// <---------- DELETE REQUEST ---------->
// DELETE product review
router.route("/product/review/:id").delete(isAuth, deleteReview);
export default router;
