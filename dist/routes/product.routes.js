import { Router } from "express";
import { activeBillboard, allChildCategoriesOfParentCategory, allParentCategories, cartProducts, createOrUpdateReview, deleteReview, featuredProducts, filteredproducts, getAllproducts, newArrivalProducts, productDetails, productReviews, similarProducts, wishlistProducts, } from "../controllers/product.controller.js";
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
// GET cart products
router.route("/products/cart").get(isAuth, cartProducts);
// GET product details
router.route("/products/:id").get(productDetails);
// GET product reviews
router.route("/product/reviews/:id").get(productReviews);
// GET active billboard
router.route("/billboard/active").get(activeBillboard);
// GET all parent categories
router.route("/category/parent/public").get(allParentCategories);
// GET all child categories of a parent category
router
    .route("/category/child/public/:id")
    .get(allChildCategoriesOfParentCategory);
// <---------- POST REQUEST ---------->
// POST create/update product review
router.route("/products/:id").post(isAuth, createOrUpdateReview);
// <---------- DELETE REQUEST ---------->
// DELETE product review
router.route("/product/review/:id").delete(deleteReview);
export default router;
