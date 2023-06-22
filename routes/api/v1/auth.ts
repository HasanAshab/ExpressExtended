import { controller, middleware } from "helpers";
import express, { Router } from "express";

const router: Router = express.Router();
const AuthController = controller("AuthController");

// Endpoints to authenticate users
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);


router.get("/verify/:id", middleware("signed"), AuthController.verifyEmail);
router.post("/verify/resend", middleware(["limit", {time: 60 * 1000, count: 6}]), AuthController.resendEmailVerification);

router.post("/password/forgot", middleware(["limit", {time: 60 * 1000, count: 6}]), AuthController.forgotPassword);
router.put("/password/reset", AuthController.resetPassword);
router.put("/password/change", middleware("auth"), AuthController.changePassword);

router.route("/profile")
  .get(middleware("auth"), AuthController.profile)
  .put(middleware("auth"), AuthController.updateProfile);

export default router;
