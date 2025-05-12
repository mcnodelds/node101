import bcrypt from "bcryptjs";
import * as jose from "jose";

import repo from "#repo.js";
import { tryCatch } from "#utils.js";

/**
 * @typedef {import("../models/user.js").User} User
 */

/**
 * Enum for authentication error types.
 * @readonly
 * @enum {string}
 */
export const AuthErrorType = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    USERNAME_TAKEN: "USERNAME_TAKEN",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    SERVER_ERROR: "SERVER_ERROR",
    UNEXPECTED_ERROR: "UNEXPECTED",
};

/**
 * Custom error class for authentication errors.
 */
export class AuthError extends Error {
    /**
     * @param {AuthErrorType} type - One of the AuthErrorType values.
     * @param {string} [message] - Optional custom error message.
     */
    constructor(type, message = "") {
        super(message || type);
        this.name = "AuthError";
        this.type = type;
    }
}

/**
 * Represents the user object as returned by the API (excluding sensitive fields).
 * @typedef {object} UserResponse
 * @property {number|string} id - The unique identifier for the user.
 * @property {string} username - The user's username.
 * @property {string|null} [email] - The user's email address (optional).
 */

/**
 * Data required for user registration.
 * @typedef {object} RegistrationData
 * @property {string} username - The username.
 * @property {string} password - The password.
 * @property {string|null} [email] - The user's email (optional).
 */

/**
 * Data required for user login.
 * @typedef {object} LoginData
 * @property {string} username - The username.
 * @property {string} password - The password.
 */

/**
 * The successful response structure for authentication operations.
 * @typedef {object} AuthResponse
 * @property {UserResponse} user - The authenticated user's details.
 * @property {string} token - The JWT.
 */

/**
 * Expected payload structure of the JWT.
 * @typedef {object} AuthClaims
 * @property {number|string} id - The user's ID.
 * @property {string} username - The user's username.
 * @property {string} role - The user's role.
 * @property {number} [iat] - Issued at timestamp.
 * @property {number} [exp] - Expiration timestamp.
 */

const JWT_SECRET =
    process.env.JWT_SECRET || "your-super-secret-and-complex-key-for-dev";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const secretKey = new TextEncoder().encode(JWT_SECRET);
const alg = "HS256";

/**
 * Generates a JWT for a user.
 * @param {User} user - The user object (requires at least user.id and user.username).
 * @returns {Promise<string>} The generated JWT.
 */
async function generateToken(user) {
    if (!user || !user.id || !user.username) {
        throw new Error(
            "User ID and username are required to generate a token."
        );
    }

    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
    };

    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        // .setIssuer('urn:example:issuer') // Optional: set your issuer
        // .setAudience('urn:example:audience') // Optional: set your audience
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);

    return jwt;
}

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {Promise<AuthClaims | null>} The decoded payload if the token is valid, otherwise null.
 */
export async function verifyToken(token) {
    if (!token) {
        console.error("Token verification failed: No token provided.");
        return null;
    }
    const { result: payload, error } = await tryCatch(() =>
        jose.jwtVerify(
            token,
            secretKey
            // {
            //    issuer: 'urn:example:issuer', // Optional: if set during signing
            //    audience: 'urn:example:audience', // Optional: if set during signing
            // }
        )
    );

    if (error != null) {
        console.error("Invalid token", error);
        return null;
    }

    return /** @type {AuthClaims} */ (payload.payload);
}

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Processes user registration.
 * @param {RegistrationData} registrationData - The data for user registration.
 * @returns {Promise<AuthResponse>} An object containing the new user (minus password hash) and a JWT.
 * @throws {AuthError} If username already exists or other registration errors occur.
 */
export async function register({ username, password, email }) {
    const { result: existingUser, error: ferror } = await tryCatch(() =>
        repo.findByUsername(username)
    );

    if (ferror != null) {
        console.error(ferror);
        throw ferror;
    }

    if (existingUser != null) {
        throw new AuthError(AuthErrorType.USERNAME_TAKEN);
    }

    const { result: passwordHash, error: herror } = await tryCatch(() =>
        bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
    );

    if (herror != null) {
        console.error(herror);
        throw new AuthError(AuthErrorType.SERVER_ERROR);
    }

    const { result: newUser, error: cerror } = await tryCatch(() =>
        repo.create(username, passwordHash, email)
    );

    if (cerror != null) {
        console.error(cerror);
        throw new AuthError(AuthErrorType.SERVER_ERROR);
    }

    const { result: token, error: terror } = await tryCatch(() =>
        generateToken(newUser)
    );
    if (terror != null) {
        console.error(cerror);
        throw new AuthError(AuthErrorType.SERVER_ERROR);
    }

    const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
    };

    return {
        user: userResponse,
        token,
    };
}

/**
 * Processes user login.
 * @param {LoginData} loginData - The data for user login.
 * @returns {Promise<AuthResponse>} An object containing the user (minus password hash) and a JWT.
 * @throws {AuthError} If credentials are invalid or other login errors occur.
 */
export async function login({ username, password }) {
    const { result: user, error: findError } = await tryCatch(() =>
        repo.findByUsername(username)
    );

    if (findError != null) {
        console.error(findError);
        throw new AuthError(AuthErrorType.SERVER_ERROR);
    }

    if (!user) {
        throw new AuthError(AuthErrorType.INVALID_CREDENTIALS);
    }

    const { result: isPasswordMatch, error: compareError } = await tryCatch(
        () => bcrypt.compare(password, user.passwordHash)
    );

    if (compareError != null) {
        console.error(compareError);
        throw new AuthError(AuthErrorType.SERVER_ERROR);
    }

    if (!isPasswordMatch) {
        throw new AuthError(AuthErrorType.INVALID_CREDENTIALS);
    }

    const { result: token, error: tokenError } = await tryCatch(() =>
        generateToken(user)
    );

    if (tokenError != null) {
        console.error(tokenError);
        throw new AuthError(AuthErrorType.SERVER_ERROR);
    }

    const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
    };

    return {
        user: userResponse,
        token,
    };
}

export default {
    register,
    login,
    verifyToken,
    AuthError,
    AuthErrorType,
};
