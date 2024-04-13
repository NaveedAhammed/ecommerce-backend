import express, { Router } from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { checkoutSession } from "../controllers/checkout.controller.js";

const router: Router = Router();

// POST checkout session
router.route("/create-checkout-session").post(isAuth, checkoutSession);

export default router;
