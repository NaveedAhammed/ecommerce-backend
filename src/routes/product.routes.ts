import { Router } from "express";
import {
	activeBillboard,
	cartProducts,
	createOrUpdateReview,
	deleteReview,
	featuredProducts,
	getAllproducts,
	newArrivalProducts,
	productDetails,
	productReviews,
	similarProducts,
	wishlistProducts,
} from "../controllers/product.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// <---------- GET REQUEST ---------->
router.route("/products").get(getAllproducts);
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

// <---------- POST REQUEST ---------->
// POST create/update product review
router.route("/products/:id").post(isAuth, createOrUpdateReview as any);

// <---------- DELETE REQUEST ---------->
// DELETE product review
router.route("/product/review/:id").delete(deleteReview as any);

export default router;
