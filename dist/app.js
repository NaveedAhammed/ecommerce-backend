import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./utils/database.js";
const PORT = process.env.PORT;
const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://ecommerce-backend-af7n.onrender.com",
        "https://ecommerce-frontend-yunh.onrender.com",
        "https://ecommerce-admin-v3hk.onrender.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.get("/health", (req, res) => {
    res.send({ message: "Health OK!" });
});
// webhook route
app.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
    res.status(200).end(); //add .end() to solve the issue
});
// routes import
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
// routes declaration
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", checkoutRoutes);
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
