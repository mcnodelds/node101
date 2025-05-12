/**
 * @typedef {object} User
 * @property {number|string} id - The unique identifier for the user.
 * @property {string} username - The user's username.
 * @property {string} passwordHash - The user's hashed password.
 * @property {string|null} [email] - The user's email address (optional).
 */

/**
 * Creates a user object.
 * @param {number|string} id - The unique identifier for the user.
 * @param {string} username - The user's username.
 * @param {string} passwordHash - The user's hashed password.
 * @param {string|null} email - The user's email address (optional).
 * @returns {User} The user object.
 */
function createUser(id, username, passwordHash, email = null) {
    return {
        id,
        username,
        passwordHash,
        email,
    };
}

export default {
    create: createUser,
};
