import express from "express";
import "dotenv/config";
import cors from "cors";

import { connect } from "./utils/database.js";

const PORT: string | undefined = process.env.PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes import
import userRoutes from "./routes/user.routes.js";
// routes declaration
app.use("/api/v1/user", userRoutes);

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
