import multer from "multer";

import { Router } from "express";
import {
	adminLogin,
	allBillboards,
	allChildCategories,
	allColors,
	allOrders,
	allParentCategories,
	allProducts,
	allSizes,
	allUsers,
	createBillboard,
	createChildCategory,
	createColor,
	createParentCategory,
	createProduct,
	createUnit,
	deleteChildCategory,
	deleteColor,
	deleteOrder,
	deleteParentCategory,
	deleteProduct,
	deleteProductImage,
	deleteUnit,
	deleteUser,
	refresh,
	singleUser,
	updateBillboard,
	updateChildCategory,
	updateColor,
	updateParentCategory,
	updateProduct,
	updateUnit,
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
// GET all child categories
router.route("/categories/child").get(isAuth, isAdmin, allChildCategories);
// GET all parent categories
router.route("/categories/parent").get(isAuth, isAdmin, allParentCategories);
// GET all billboards
router.route("/billboards").get(isAuth, isAdmin, allBillboards);
// GET all colors
router.route("/colors").get(isAuth, isAdmin, allColors);
// GET all sizes
router.route("/units").get(isAuth, isAdmin, allSizes);
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
// POST create unit
router.route("/unit/new").post(isAuth, isAdmin, createUnit);
// POST create color
router.route("/color/new").post(isAuth, isAdmin, createColor);
// POST create child category
router.route("/category/child/new").post(isAuth, isAdmin, createChildCategory);
// POST create category
router
	.route("/category/parent/new")
	.post(isAuth, isAdmin, createParentCategory);
// POST create billboard
router
	.route("/billboard/new")
	.post(isAuth, isAdmin, upload.single("image"), createBillboard);

// <---------- PUT REQUEST ---------->
//PUT user role
router.route("/users/:id").put(isAuth, isAdmin, updateUserRole);
// PUT child category
router
	.route("/category/child/update/:id")
	.put(isAuth, isAdmin, updateChildCategory);
// PUT category
router
	.route("/category/parent/update/:id")
	.put(isAuth, isAdmin, updateParentCategory);
// PUT unit
router.route("/unit/update/:id").put(isAuth, isAdmin, updateUnit);
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
// DELETE delete category
router
	.route("/category/child/delete/:id")
	.delete(isAuth, isAdmin, deleteChildCategory);
// DELETE parent category
router
	.route("/category/parent/delete/:id")
	.delete(isAuth, isAdmin, deleteParentCategory);
// DELETE color
router.route("/color/delete/:id").delete(isAuth, isAdmin, deleteColor);
// DELETE size
router.route("/unit/delete/:id").delete(isAuth, isAdmin, deleteUnit);
// DELETE product image
router
	.route("/product/image/delete/:id")
	.delete(isAuth, isAdmin, deleteProductImage);

export default router;
