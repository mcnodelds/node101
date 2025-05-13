import express from "express";
import auth from "#controllers/auth.js";
import { attach, asyncHandler } from "#utils.js";

/**
 * @typedef {import("#controllers/auth.js").AuthClaims} AuthClaims
 */

/**
 * Type for authorization check function
 * @typedef {
       (req: express.Request, claims: AuthClaims) => boolean | Promise<boolean>
 } AuthorizationCheck
 */

/**
 * @typedef {object} AuthorizeMiddlewareParams
 * @property {string[]} [roleWhitelist] - Allowed roles
 * @property {AuthorizationCheck} [check] - Custom authorization check
 */

/**
 * Express middleware to authenticate a user based on a JWT.
 * Expects a JWT in the 'Authorization' header with the 'Bearer' scheme.
 * If authentication is successful, attaches the decoded JWT payload to `req.user`.
 * @param {AuthorizeMiddlewareParams} params - rules to use with authorization
 * @returns {express.Handler} - handler that you can attach to router
 */
export const authorize = (params) => {
    return asyncHandler(async (req, res, next) => {
        const authHeader = req.get("Authorization");
        const token =
            authHeader &&
            authHeader.startsWith("Bearer ") &&
            authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({
                message: "Access denied. No token provided.",
            });
            return;
        }

        const claims = await auth.verifyToken(token);

        if (!claims) {
            res.status(401).json({
                message: "Access denied. Invalid or expired token.",
            });
            return;
        }

        let isAuthorized = false;

        if (!isAuthorized && params.roleWhitelist) {
            isAuthorized = params.roleWhitelist.includes(claims.role);
        }

        if (!isAuthorized && params.check) {
            isAuthorized = await params.check(req, claims);
        }

        if (!isAuthorized) {
            res.status(403).json({
                message: "Access denied.",
            });

            return;
        }

        attach(req, "claims", claims);
        next();
        return;
    });
};

export default {
    authorize,
};
