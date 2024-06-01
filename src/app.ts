import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import Stripe from "stripe";

const STRIPE = new Stripe(process.env.STRIPE_SECRET_KEY as string);

import { connect } from "./utils/database.js";

const PORT: string | undefined = process.env.PORT;

const app = express();

app.use(
	cors({
		origin: [
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
			"https://ecommerce-backend-af7n.onrender.com",
			"https://ecommerce-frontend-yunh.onrender.com",
			"https://ecommerce-admin-v3hk.onrender.com",
			"https://popshop-a9dp.onrender.com",
		],
		credentials: true,
		optionsSuccessStatus: 200,
	})
);
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use("/api/v1/webhook", express.raw({ type: "*/*" }));

app.use(express.json({ limit: "5mb" }));

app.get("/health", (req: Request, res: Response) => {
	res.send({ message: "Health OK!" });
});

// routes import
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderRoutes from "./routes/order.routes.js";
// routes declaration
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", checkoutRoutes);
app.use("/api/v1", orderRoutes);

import { error } from "./middlewares/error.middleware.js";
// error middleware
app.use(error);

connect()
	.then(() => {
		app.listen(PORT || 8000, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
