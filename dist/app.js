import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./utils/database.js";
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
// routes import
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
// routes declaration
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);
import { error } from "./middlewares/error.middleware.js";
// error middleware
app.use(error);
connect()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.log(err);
});
