import { Router } from "express";
import { createOrUpdateReview, deleteReview, featuredProducts, productDetails, productReviews, products, } from "../controllers/product.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
const router = Router();
// <---------- GET REQUEST ---------->
router.route("/products").get(isAuth, products);
// GET product details
router.route("/products/:id").get(productDetails);
// GET product reviews
router.route("/product/reviews/:id").get(productReviews);
// GET featured products
router.route("/products/featured").get(featuredProducts);
// <---------- POST REQUEST ---------->
// POST create/update product review
router.route("/products/:id").post(isAuth, createOrUpdateReview);
// <---------- DELETE REQUEST ---------->
// DELETE product review
router.route("/product/review/:id").delete(deleteReview);
export default router;
