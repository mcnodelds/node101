import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { schema as userSchema } from "#models/user.js";

/** @typedef {import("zod").infer<typeof userSchema>} User */
/**
     @typedef {
    import("zod").infer<
        typeof import("#models/role.js").schema
    >
} Role */
/**
     @typedef {
        import("zod").infer<
        typeof import("#models/dish.js").schema
    >
} Dish */

let nextId = 1;

/** @type {User[]} */
const users = [];
/** @type {Dish[]} */
let menu = [];

/**
 * Loads users using sync read.
 * @returns {void}
 */
function seedUsersSync() {
    const data = fs.readFileSync(
        path.join(import.meta.dirname, "../priv/users.json"),
        "utf-8"
    );
    users.push(
        ...z
            .array(userSchema.omit({ id: true }))
            .parse(JSON.parse(data))
            .map((u) => ({ id: nextId++, ...u }))
    );
}

/**
 * Loads users using callback.
 * @returns {void}
 */
function seedUsersCallback() {
    fs.readFile(
        path.join(import.meta.dirname, "../priv/users.json"),
        (err, data) => {
            if (err != null) {
                throw err;
            }

            users.push(
                ...z
                    .array(userSchema.omit({ id: true }))
                    .parse(JSON.parse(data.toString()))
                    .map((u) => ({ id: nextId++, ...u }))
            );
        }
    );
}

/**
 * Loads users using Promises.
 * @returns {Promise<void>}
 */
function seedUsersPromise() {
    return fs.promises
        .readFile(path.join(import.meta.dirname, "../priv/users.json"), "utf8")
        .then((data) => {
            users.push(
                ...z
                    .array(userSchema.omit({ id: true }))
                    .parse(JSON.parse(data.toString()))
                    .map((u) => ({ id: nextId++, ...u }))
            );
        });
}

/**
 * Loads users using async/await.
 * @returns {Promise<void>}
 */
async function seedUsersAsync() {
    const data = await fs.promises.readFile(
        path.join(import.meta.dirname, "../priv/users.json"),
        "utf8"
    );

    users.push(
        ...z
            .array(userSchema.omit({ id: true }))
            .parse(JSON.parse(data.toString()))
            .map((u) => ({ id: nextId++, ...u }))
    );
}

// just ignore warnings about unused stuff
[seedUsersSync, seedUsersAsync, seedUsersPromise];
seedUsersCallback();

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

/**
 * Returns whole menu
 * @returns {Promise<Dish[]>} The menu itself.
 */
export async function getMenu() {
    return menu;
}

/**
 * Creates a new dish.
 * @param {string} name - The name.
 * @param {number} portion - The portion od dish.
 * @param {number} price - The price of dish.
 * @param {string} description - The description.
 * @param {string} imageurl - The image.
 * @returns {Promise<Dish>} The new dish.
 */
export async function createMenuItem(
    name,
    portion,
    price,
    description,
    imageurl
) {
    const newDish = {
        id: nextId++,
        name,
        portion,
        price,
        description,
        imageurl,
    };

    menu.push(newDish);
    return newDish;
}

/**
 * Creates a new dish.
 * @param {number} id - The ID of dish.
 * @returns {Promise<void>} The new dish.
 */
export async function deleteMenuItemById(id) {
    menu = menu.filter((dish) => dish.id !== id);
    return;
}

/**
 * Changes info about dish.
 * @param {number} id - The ID of dish.
 * @param {string} name - The name.
 * @param {number} portion - The portion od dish.
 * @param {number} price - The price of dish.
 * @param {string} description - The description.
 * @param {string} imageurl - The image.
 * @returns {Promise<Dish|null>} The updated dish.
 */
export async function updateMenuItemById(
    id,
    name,
    portion,
    price,
    description,
    imageurl
) {
    let dish = menu.find((u) => u.id === id) || null;
    if (dish == null) {
        return null;
    }
    dish.name = name;
    dish.portion = portion;
    dish.price = price;
    dish.description = description;
    dish.imageurl = imageurl;
    return dish;
}

/**
 * Finds a  dish.
 * @param {number} id - The ID of dish.
 * @returns {Promise<Dish|null>} The dish.
 */
export async function findMenuItemById(id) {
    return menu.find((dish) => dish.id === id) || null;
}
export default {
    findUserByUsername,
    findUserById,
    createUser,
    clearAllUsers,
    getMenu,
    createMenuItem,
    deleteMenuItemById,
    updateMenuItemById,
    findMenuItemById,
};
