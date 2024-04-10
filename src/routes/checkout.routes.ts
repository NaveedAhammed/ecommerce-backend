import { Router } from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
	checkoutSession,
	webhook,
} from "../controllers/checkout.controller.js";

const router: Router = Router();

// POST checkout session
router.route("/create-checkout-session").post(isAuth, checkoutSession);
// POST webhook
router.route("/webhook").post(webhook);

export default router;
