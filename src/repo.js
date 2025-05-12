import { z } from "zod";
import user from "#models/user.js";

/** @typedef {z.infer<typeof user.schema>} User */

/** @type {User[]} */
const users = [];
let nextId = 1;

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<User|null>} The found user or null.
 */
async function findByUsername(username) {
    return new Promise((resolve) => {
        const user = users.find((u) => u.username === username);

        resolve(user || null);
    });
}

/**
 * Finds a user by their ID.
 * @param {number|string} id - The ID of the user.
 * @returns {Promise<User|null>} The found user or null.
 */
async function findById(id) {
    return new Promise((resolve) => {
        // Ensure consistent ID type if needed, though in-memory might be flexible
        const userId = typeof id === "string" ? parseInt(id, 10) : id;
        const user = users.find((u) => u.id === userId);
        resolve(user || null);
    });
}

/**
 * Creates a new user.
 * @param {string} username - The username.
 * @param {string} passwordHash - The hashed password.
 * @param {string|null} [email] - The user's email (optional).
 * @returns {Promise<User>} The created user.
 */
async function create(username, passwordHash, email = null) {
    return new Promise((resolve) => {
        const newUser = {
            id: nextId++,
            username,
            passwordHash,
            email,
        }

        users.push(newUser);
        resolve(newUser);
    });
}

/**
 * (Optional) Clears all users from the repository. Useful for testing.
 * @returns {Promise<void>}
 */
async function clearAll() {
    return new Promise((resolve) => {
        users.length = 0;
        nextId = 1;
        resolve();
    });
}

export default {
    findByUsername,
    findById,
    create,
    clearAll,
};
