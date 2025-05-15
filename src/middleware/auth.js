import express from "express";
import auth from "#handlers/auth.js";
import { attach, asyncHandler } from "#utils.js";

/**
 * @typedef {import("#handlers/auth.js").AuthClaims} AuthClaims
 */

/** @typedef {"api" | "client" | "ignore"} AuthMode */

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
 * @property {AuthMode} [mode] - A mode of authorize, if api will result in json, if client -- in render("pages/notfound")
 */

/**
 * Express middleware to authenticate a user based on a JWT.
 * Expects a JWT in the 'Authorization' header with the 'Bearer' scheme or authToken in cookies.
 * If authentication is successful, attaches the decoded JWT payload to `req.context.claims`.
 * @param {AuthorizeMiddlewareParams} params - rules to use with authorization
 * @returns {express.Handler} - handler that you can attach to router
 */

/**
 *
 * @param params
 */
export function authorize(params) {
    return asyncHandler(async (req, res, next) => {
        let claims = undefined;
        const mode = params.mode || "api";
        /** @type {string?} */
        let token = null;

        const authHeader = req.get("Authorization");
        if (!token && authHeader?.startsWith("Bearer ")) {
            token = authHeader.substring("Bearer ".length);
        }

        if (!token && req.cookies?.authToken) {
            token = req.cookies.authToken;
        }

        if (!token) {
            render(res, mode, 401, "Access denied. No token provided.", next);
            return;
        }

        claims = await auth.verifyToken(token);

        if (!claims) {
            render(
                res,
                mode,
                401,
                "Access denied. Invalid or expired token.",
                next
            );
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
            render(res, mode, 403, "Access denied.", next);
            return;
        }

        attach(req, "claims", claims);
        next();
        return;
    });
}

/**
 * Sends an appropriate error response based on the authentication mode.
 * @param {express.Response} res - The Express response object used to send the HTTP response.
 * @param {AuthMode} mode - The mode of the request; either "client" (renders an HTML page) or "api" (returns JSON).
 * @param {number} code - The HTTP status code to send with the response (used only in API mode).
 * @param {string} message - The error message to include in the JSON response (used only in API mode).
 * @param {express.NextFunction} next - The function that will be executed in ignore mode
 * @returns {void}
 */
function render(res, mode, code, message, next) {
    if (mode == "client") {
        res.render("pages/notfound");
        return;
    }

    if (mode == "api") {
        res.status(code).json({
            message: message,
        });
        return;
    }

    if (mode == "ignore") {
        next();
        return;
    }
}

export default {
    authorize,
};
