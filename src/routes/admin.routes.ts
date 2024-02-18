import { Router } from "express";
import {
  allUsers,
  deleteUser,
  singleUser,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// GET all users
router.route("/users").get(isAdmin as any, allUsers);
// GET single user
router.route("/users/:id").get(isAdmin as any, singleUser);

//POST update user role
router.route("/users/:id").put(isAdmin as any, updateUserRole);
// POST delete user
router.route("/users/:id").delete(isAdmin as any, deleteUser);

export default router;
