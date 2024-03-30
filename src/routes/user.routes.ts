import { Router } from "express";
import {
	addShippingAddress,
	addToCart,
	addorRemoveWishlistId,
	deleteCartItem,
	deleteShippingAddress,
	loginUser,
	myProfile,
	refresh,
	registerUser,
	toggleCartItemQuantity,
	updateMyProfile,
	updateProfilePicture,
	updateShippingAddress,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router: Router = Router();

// <---------- GET REQUEST ---------->
// GET my profile
router.route("/myProfile").get(isAuth, myProfile);
// GET refresh
router.route("/refresh").get(refresh);

// <---------- POST REQUEST ---------->
// POST register user
router.route("/register").post(registerUser);
// POST login user
router.route("/login").post(loginUser);
// POST add or remove wishlist
router.route("/user/wishlist/:productId").post(isAuth, addorRemoveWishlistId);
// POST add to cart
router.route("/user/cart/add/:productId").post(isAuth, addToCart);
// POST toggle cart item quantity
router.route("/user/cart/:productId").post(isAuth, toggleCartItemQuantity);
// POST add new shipping address
router.route("/user/shippingAddress/new").post(isAuth, addShippingAddress);

// <---------- PUT REQUEST ---------->
// PUT my profile
router.route("/myProfile/update").put(isAuth, updateMyProfile);
// PUT my profile picture
router
	.route("/myProfile/picture/update")
	.put(isAuth, upload.single("avatar"), updateProfilePicture);
// PUT update shipping address
router
	.route("/user/shippingAddress/update/:id")
	.put(isAuth, updateShippingAddress);

// <---------- DELETE REQUEST ---------->
// DELETE cart item
router.route("/user/cart/:productId").delete(isAuth, deleteCartItem);
// DELETE shipping address
router
	.route("/user/shippingAddress/delete/:id")
	.delete(isAuth, deleteShippingAddress);

export default router;
