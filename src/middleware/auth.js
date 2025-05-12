import express from "express";
import expressAsyncHandler from "express-async-handler";
import auth from "#controllers/auth.js";
import { attach } from "#utils.js";

/**
 * Express middleware to authenticate a user based on a JWT.
 * Expects a JWT in the 'Authorization' header with the 'Bearer' scheme.
 * If authentication is successful, attaches the decoded JWT payload to `req.user`.
 * @type {express.Handler}
 */
export const authorize = expressAsyncHandler(async (req, res, next) => {
    const authHeader = req.get("Authorization");
    const token =
        authHeader &&
        authHeader.startsWith("Bearer ") &&
        authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }

    const userPayload = await auth.verifyToken(token);

    if (!userPayload) {
        res.status(401).json({
            message: "Access denied. Invalid or expired token.",
        });
        return;
    }

    // if (!hasRequiredPermissions(req.user, requiredPermissions)) {
    //     return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
    // }

    attach(req, "user", userPayload);

    next();
    return;
});

export default {
    authorize,
};
