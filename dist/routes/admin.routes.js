import { Router } from "express";
import { allUsers, deleteUser, singleUser, updateUserRole, } from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/auth.middleware.js";
const router = Router();
// GET all users
router.route("/users").get(isAdmin, allUsers);
// GET single user
router.route("/users/:id").get(isAdmin, singleUser);
//POST update user role
router.route("/users/:id").put(isAdmin, updateUserRole);
// POST delete user
router.route("/users/:id").delete(isAdmin, deleteUser);
export default router;
