import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";

const router: Router = Router();

// AUTH routes
// POST register user
router.route("/register").post(registerUser);
// POST login user
router.route("/login").post(loginUser);

export default router;
