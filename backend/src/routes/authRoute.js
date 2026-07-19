import express from "express";
import {
    userForgotPassword,
    userLogin,
    userRegister,
    userResetPassword,
    userLoginOAuth
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/login/oauth", userLoginOAuth);
router.post("/forgot-password", userForgotPassword);
router.post("/reset-password", userResetPassword);

export default router;
