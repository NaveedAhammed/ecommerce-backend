import multer from "multer";

import { Router } from "express";
import {
	adminLogin,
	allBillboards,
	allCategories,
	allColors,
	allOrders,
	allProducts,
	allSizes,
	allUsers,
	createBillboard,
	createCategory,
	createColor,
	createProduct,
	createSize,
	deleteCategory,
	deleteColor,
	deleteOrder,
	deleteProduct,
	deleteProductImage,
	deleteSize,
	deleteUser,
	refresh,
	singleUser,
	updateBillboard,
	updateCategory,
	updateColor,
	updateProduct,
	updateSize,
	updateUserRole,
} from "../controllers/admin.controller.js";
import { isAdmin, isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads");
	},
	filename: function (req, file, cb) {
		cb(
			null,
			`${file.fieldname}_dateVal_${Date.now()}_${file.originalname}`
		);
	},
});

const router: Router = Router();

// <---------- GET REQUEST ---------->
// GET all users
router.route("/users").get(isAuth, isAdmin, allUsers);
// GET all categories
router.route("/categories").get(isAuth, isAdmin, allCategories);
// GET all billboards
router.route("/billboards").get(isAuth, isAdmin, allBillboards);
// GET all colors
router.route("/colors").get(isAuth, isAdmin, allColors);
// GET all sizes
router.route("/sizes").get(isAuth, isAdmin, allSizes);
// GET single user
router.route("/users/:id").get(isAuth, isAdmin, singleUser);
// GET all orders
router.route("/orders").get(isAuth, isAdmin, allOrders);
// GET admin refresh
router.route("/refresh").get(refresh);
// GET products
router.route("/products").get(isAuth, isAdmin, allProducts);

// <---------- POST REQUEST ---------->
// POST admin login
router.route("/login").post(adminLogin);
// POST create product
router
	.route("/product/new")
	.post(isAuth, isAdmin, upload.array("images"), createProduct);
// POST create size
router.route("/size/new").post(isAuth, isAdmin, createSize);
// POST create color
router.route("/color/new").post(isAuth, isAdmin, createColor);
// POST create category
router.route("/category/new").post(isAuth, isAdmin, createCategory);
// POST create billboard
router
	.route("/billboard/new")
	.post(isAuth, isAdmin, upload.single("image"), createBillboard);

// <---------- PUT REQUEST ---------->
//PUT user role
router.route("/users/:id").put(isAuth, isAdmin, updateUserRole);
// PUT category
router.route("/category/update/:id").put(isAuth, isAdmin, updateCategory);
// PUT size
router.route("/size/update/:id").put(isAuth, isAdmin, updateSize);
// PUT color
router.route("/color/update/:id").put(isAuth, isAdmin, updateColor);
// PUT billboard
router
	.route("/billboard/update/:id")
	.put(isAuth, isAdmin, upload.single("image"), updateBillboard);
router
	.route("/product/update/:id")
	.put(isAuth, isAdmin, upload.array("images"), updateProduct);

// <---------- DELETE REQUEST ---------->
// DELETE user
router.route("/users/:id").delete(isAuth, isAdmin, deleteUser);
// DELETE product
router.route("/product/delete/:id").delete(isAuth, isAdmin, deleteProduct);
// DELETE order
router.route("/order/delete/:id").delete(isAuth, isAdmin, deleteOrder);
// DELETE category
router.route("/category/delete/:id").delete(isAuth, isAdmin, deleteCategory);
// DELETE color
router.route("/color/delete/:id").delete(isAuth, isAdmin, deleteColor);
// DELETE size
router.route("/size/delete/:id").delete(isAuth, isAdmin, deleteSize);
// DELETE product image
router
	.route("/product/image/delete/:id")
	.delete(isAuth, isAdmin, deleteProductImage);

export default router;
