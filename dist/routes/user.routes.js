import { Router } from "express";
import { loginUser, myProfile, refresh, registerUser, updateMyProfile, uploadProfilePicture, } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
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
// POST upload profile picture
router
    .route("/myProfile")
    .post(isAuth, upload.single("avatar"), uploadProfilePicture);
// <---------- PUT REQUEST ---------->
// PUT my profile
router.route("/myProfile/update").put(isAuth, updateMyProfile);
export default router;
