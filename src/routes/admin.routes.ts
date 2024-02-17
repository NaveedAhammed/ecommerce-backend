import { Router } from "express";
import {
  allUsers,
  deleteUser,
  singleUser,
  updateUserRole,
} from "../controllers/admin.controller.js";

const router: Router = Router();

// GET all users
router.route("/users").get(allUsers);
// GET single user
router.route("/users/:id").get(singleUser);

//POST update user role
router.route("/users/:id").put(updateUserRole);
// POST delete user
router.route("/users/:id").delete(deleteUser);

export default router;
