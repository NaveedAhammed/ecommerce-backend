import { Router } from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { createOrder, myOrders, orderDetails, } from "../controllers/order.controller.js";
const router = Router();
// POST create order
router.route("/order/new").post(isAuth, createOrder);
// GET order details
router.route("/order/:id").get(isAuth, orderDetails);
// GET my orders
router.route("/myOrders").get(isAuth, myOrders);
export default router;
