import multer from "multer";

import { Router } from "express";
import {
  adminLogin,
  allCategories,
  allColors,
  allOrders,
  allSizes,
  allUsers,
  createCategory,
  createColor,
  createProduct,
  createSize,
  deleteCategory,
  deleteColor,
  deleteOrder,
  deleteSize,
  deleteUser,
  refresh,
  singleUser,
  updateCategory,
  updateColor,
  updateSize,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_dateVal_${Date.now()}_${file.originalname}`);
  },
});

const router: Router = Router();

// <---------- GET REQUEST ---------->
// GET all users
router.route("/users").get(isAdmin as any, allUsers);
// GET all categories
router.route("/categories").get(isAdmin as any, allCategories);
// GET all colors
router.route("/colors").get(isAdmin as any, allColors);
// GET all sizes
router.route("/sizes").get(isAdmin as any, allSizes);
// GET single user
router.route("/users/:id").get(isAdmin as any, singleUser);
// GET all orders
router.route("/orders").get(isAdmin as any, allOrders);
// GET admin refresh
router.route("/refresh").get(refresh);

// <---------- POST REQUEST ---------->
// POST admin login
router.route("/login").post(adminLogin);
// POST create product
router
  .route("/product/new")
  .post(isAdmin as any, upload.array("images"), createProduct);
// POST create size
router.route("/size/new").post(isAdmin as any, createSize);
// POST create color
router.route("/color/new").post(isAdmin as any, createColor);
// POST create category
router.route("/category/new").post(isAdmin as any, createCategory);

// <---------- PUT REQUEST ---------->
//PUT user role
router.route("/users/:id").put(isAdmin as any, updateUserRole);
// PUT category
router.route("/category/update/:id").put(isAdmin as any, updateCategory);
// PUT size
router.route("/size/update/:id").put(isAdmin as any, updateSize);
// PUT color
router.route("/color/update/:id").put(isAdmin as any, updateColor);

// <---------- DELETE REQUEST ---------->
// DELETE user
router.route("/users/:id").delete(isAdmin as any, deleteUser);
// DELETE order
router.route("/order/delete/:id").delete(isAdmin as any, deleteOrder);
// DELETE category
router.route("/category/delete/:id").put(isAdmin as any, deleteCategory);
// DELETE color
router.route("/color/delete/:id").put(isAdmin as any, deleteColor);
// DELETE size
router.route("/size/delete/:id").put(isAdmin as any, deleteSize);

export default router;
