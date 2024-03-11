import multer from "multer";
import { Router } from "express";
import { adminLogin, allCategories, allColors, allOrders, allProducts, allSizes, allUsers, createCategory, createColor, createProduct, createSize, deleteCategory, deleteColor, deleteOrder, deleteSize, deleteUser, refresh, singleUser, updateCategory, updateColor, updateSize, updateUserRole, } from "../controllers/admin.controller.js";
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
const router = Router();
// <---------- GET REQUEST ---------->
// GET all users
router.route("/users").get(isAdmin, allUsers);
// GET all categories
router.route("/categories").get(isAdmin, allCategories);
// GET all colors
router.route("/colors").get(isAdmin, allColors);
// GET all sizes
router.route("/sizes").get(isAdmin, allSizes);
// GET single user
router.route("/users/:id").get(isAdmin, singleUser);
// GET all orders
router.route("/orders").get(isAdmin, allOrders);
// GET admin refresh
router.route("/refresh").get(refresh);
// GET products
router.route("/products").get(isAdmin, allProducts);
// <---------- POST REQUEST ---------->
// POST admin login
router.route("/login").post(adminLogin);
// POST create product
router
    .route("/product/new")
    .post(isAdmin, upload.array("images"), createProduct);
// POST create size
router.route("/size/new").post(isAdmin, createSize);
// POST create color
router.route("/color/new").post(isAdmin, createColor);
// POST create category
router.route("/category/new").post(isAdmin, createCategory);
// <---------- PUT REQUEST ---------->
//PUT user role
router.route("/users/:id").put(isAdmin, updateUserRole);
// PUT category
router.route("/category/update/:id").put(isAdmin, updateCategory);
// PUT size
router.route("/size/update/:id").put(isAdmin, updateSize);
// PUT color
router.route("/color/update/:id").put(isAdmin, updateColor);
// <---------- DELETE REQUEST ---------->
// DELETE user
router.route("/users/:id").delete(isAdmin, deleteUser);
// DELETE order
router.route("/order/delete/:id").delete(isAdmin, deleteOrder);
// DELETE category
router.route("/category/delete/:id").put(isAdmin, deleteCategory);
// DELETE color
router.route("/color/delete/:id").put(isAdmin, deleteColor);
// DELETE size
router.route("/size/delete/:id").delete(isAdmin, deleteSize);
export default router;
