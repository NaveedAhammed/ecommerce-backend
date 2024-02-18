import { Router } from "express";
import {
  createOrUpdateReview,
  deleteReview,
  productDetails,
  productReviews,
} from "../controllers/product.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// GET product details
router.route("/product/:id").get(productDetails);
// GET product reviews
router.route("/product/reviews/:id").get(productReviews);
// POST create/update product review
router.route("/product/:id").post(isAuth, createOrUpdateReview as any);
// POST delete product review
router.route("/product/review/:id").delete(deleteReview as any);

export default router;
