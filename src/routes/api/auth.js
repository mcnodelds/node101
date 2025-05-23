import express from "express";
import { z } from "zod";
import auth from "#handlers/auth.js";
import { tryCatch, asyncHandler } from "#utils.js";
import { validate } from "#middleware/validate.js";

/** @type {express.Router} */
const router = express.Router();

/** @type {express.CookieOptions} */
const cookieOpts = {
    sameSite: "strict",
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
};

export const registerSchema = z.object({
    username: z.string().min(3).max(32),
    password: z.string().min(6),
    email: z.string().email(),
});

router.post(
    "/register",
    validate(registerSchema),
    asyncHandler(async (req, res) => {
        const { result, error } = await tryCatch(() =>
            auth.register(
                /** @type {import("zod").infer<typeof registerSchema>} */ (
                    req.body
                )
            )
        );

        if (error instanceof auth.AuthError) {
            console.error("Register error:", error);
            res.status(400).json({
                type: error.type,
                message: error.message || "Registration failed.",
            });
            return;
        }

        if (error != null) {
            console.error("Register error:", error);
            res.status(400).json({
                type: auth.AuthErrorType.UNEXPECTED_ERROR,
                message: auth.AuthErrorType.UNEXPECTED_ERROR,
            });
            return;
        }

        res.cookie("authToken", result.token, cookieOpts).status(201).json({
            message: "User registered successfully.",
            user: result.user,
            token: result.token,
        });
    })
);

export const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});

router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(async (req, res) => {
        const { result, error } = await tryCatch(() =>
            auth.login(
                /** @type {import("zod").infer<typeof loginSchema>} */ (
                    req.body
                )
            )
        );

        if (error instanceof auth.AuthError) {
            console.error("Login error:", error);
            res.status(401).json({
                type: error.type,
                message: error.message || "Login failed.",
            });

            return;
        }

        if (error != null) {
            console.error("Login error:", error);
            res.status(401).json({
                type: auth.AuthErrorType.UNEXPECTED_ERROR,
                message: auth.AuthErrorType.UNEXPECTED_ERROR,
            });
            return;
        }

        res.cookie("authToken", result.token, cookieOpts).status(200).json({
            message: "Login successful.",
            user: result.user,
            token: result.token,
        });
    })
);

export default router;
