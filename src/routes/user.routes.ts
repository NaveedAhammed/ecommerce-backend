import { Router } from "express";
import {
  loginUser,
  myProfile,
  registerUser,
  updateMyProfile,
  uploadProfilePicture,
} from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router: Router = Router();

// AUTH routes
// POST register user
router.route("/register").post(registerUser);
// POST login user
router.route("/login").post(loginUser);
// GET my profile
router.route("/myProfile").get(isAuth, myProfile);
// PUT update my profile
router.route("/myProfile").put(isAuth, updateMyProfile);
// POST upload profile picture
router
  .route("/myProfile")
  .post(isAuth, upload.single("avatar"), uploadProfilePicture);

export default router;
