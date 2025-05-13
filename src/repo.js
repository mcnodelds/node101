/**
     @typedef {
    import("zod").infer<
        typeof import("#models/user.js").schema
    >
} User */
/**
     @typedef {
    import("zod").infer<
        typeof import("#models/role.js").schema
    >
} Role */

let nextId = 1;
/** @type {User[]} */
const users = [];

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<User|null>} The found user or null.
 */
export async function findUserByUsername(username) {
    return users.find((u) => u.username === username) || null;
}

/**
 * Finds a user by their ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<User|null>} The found user or null.
 */
export async function findUserById(id) {
    return users.find((u) => u.id === id) || null;
}

/**
 * Creates a new user.
 * @param {string} username - The username.
 * @param {string} passwordHash - The hashed password.
 * @param {Role} role - The user's role.
 * @param {string|null} [email] - The user's email (optional).
 * @returns {Promise<User>} The created user.
 */
export async function createUser(username, passwordHash, role, email = null) {
    const newUser = {
        id: nextId++,
        username,
        passwordHash,
        role,
        email,
    };

    users.push(newUser);
    return newUser;
}

/**
 * (Optional) Clears all users from the repository. Useful for testing.
 * @returns {Promise<void>}
 */
export async function clearAllUsers() {
    users.length = 0;
    nextId = 1;
    return;
}

export default {
    findUserByUsername,
    findUserById,
    createUser,
    clearAllUsers,
};
