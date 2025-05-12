import { Router } from "express";
import asyncHandler from "express-async-handler";
import authController from "../../controllers/auth.js";

/** @type {Router} */
const router = Router();

router.post(
    "/register",
    asyncHandler(async (req, res) => {
        const { username, password, email } = req.body;

        const result = await authController.processRegistration({
            username,
            password,
            email,
        });

        res.status(201).json({
            message: "User registered successfully.",
            user: result.user,
            token: result.token,
        });
    })
);

router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        const result = await authController.processLogin({
            username,
            password,
        });

        res.status(200).json({
            message: "Login successful.",
            user: result.user,
            token: result.token,
        });
    })
);

export default router;
