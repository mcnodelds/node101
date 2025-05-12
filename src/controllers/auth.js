import bcrypt from "bcryptjs";
import * as jose from "jose";

import userRepository from "../repo.js";

/**
 * @typedef {import("../models/user.js").User} User
 */

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
 * @typedef {object} JwtPayload
 * @property {number|string} id - The user's ID.
 * @property {string} username - The user's username.
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

    /** @type {JwtPayload} */
    const payload = {
        id: user.id,
        username: user.username,
    };

    // Note on Post-Quantum Cryptography (PQC):
    // Standard JWT libraries like 'jose' (when using classical algorithms) use classical algorithms (e.g., HS256, RS256).
    // For PQC, you would need to:
    // 1. Use a PQC-compliant library (e.g., one supporting CRYSTALS-Dilithium or Falcon for signatures).
    // 2. Generate PQC key pairs.
    // 3. Adapt the signing and verification process to use these PQC algorithms and keys.
    // This typically involves more complex key management and potentially different token structures.
    // The current implementation uses a symmetric algorithm (HS256) for simplicity.
    // For asymmetric PQC, you'd sign with a private key and verify with a public key.

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
 * @returns {Promise<JwtPayload|null>} The decoded payload if the token is valid, otherwise null.
 */
async function verifyToken(token) {
    if (!token) {
        console.error("Token verification failed: No token provided.");
        return null;
    }
    try {
        const { payload } = await jose.jwtVerify(
            token,
            secretKey
            // {
            //    issuer: 'urn:example:issuer', // Optional: if set during signing
            //    audience: 'urn:example:audience', // Optional: if set during signing
            // }
        );
        // Cast the payload from jose to our specific JwtPayload type
        return /** @type {JwtPayload} */ (payload);
    } catch (error) {
        if (error instanceof jose.errors.JOSEError) {
            console.error(
                "Invalid token (JOSEError):",
                error.message,
                "Code:",
                error.code
            );
            // Specific error handling for common JWT issues with jose
            if (error.code === "ERR_JWT_EXPIRED") {
                // Handle expired token specifically if needed
            } else if (error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
                // Handle signature verification failure
            } else if (error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED") {
                // Handle claim validation failure (e.g. issuer, audience)
            }
        } else if (error instanceof Error) {
            console.error("Invalid token (Error):", error.message);
        } else {
            console.error("Invalid token (Unknown error type):", error);
        }
        return null; // Or re-throw the error if you want the caller to handle it
    }
}

const BCRYPT_SALT_ROUNDS = 10; // Or store in config/env

/**
 * Processes user registration.
 * @param {RegistrationData} registrationData - The data for user registration.
 * @returns {Promise<AuthResponse>} An object containing the new user (minus password hash) and a JWT.
 * @throws {Error} If username already exists, input is invalid, or other registration errors occur.
 */
async function processRegistration({ username, password, email }) {
    if (!username || !password) {
        throw new Error("Username and password are required.");
    }

    try {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error("Username already exists.");
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        /** @type {User} */
        const newUser = await userRepository.create(
            username,
            passwordHash,
            email
        );

        const token = await generateToken(newUser);

        // Exclude passwordHash from the returned user object
        /** @type {UserResponse} */
        const userResponse = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
        };

        return {
            user: userResponse,
            token,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Registration processing error:", error.message);
        } else {
            console.error(
                "Registration processing error (Unknown error type):",
                error
            );
        }
        // Re-throw the original error or a new one for the router to handle
        throw error;
    }
}

/**
 * Processes user login.
 * @param {LoginData} loginData - The data for user login.
 * @returns {Promise<AuthResponse>} An object containing the user (minus password hash) and a JWT.
 * @throws {Error} If credentials are invalid, input is invalid, or other login errors occur.
 */
async function processLogin({ username, password }) {
    if (!username || !password) {
        throw new Error("Username and password are required.");
    }

    try {
        /** @type {User | null} */
        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error("Invalid credentials."); // User not found
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordMatch) {
            throw new Error("Invalid credentials."); // Password incorrect
        }

        const token = await generateToken(user);

        // Exclude passwordHash from the returned user object
        /** @type {UserResponse} */
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
        };

        return {
            user: userResponse,
            token,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Login processing error:", error.message);
        } else {
            console.error(
                "Login processing error (Unknown error type):",
                error
            );
        }
        // Re-throw the original error or a new one for the router to handle
        throw error;
    }
}

export default {
    processRegistration,
    processLogin,
    verifyToken,
};
