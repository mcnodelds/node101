import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { schema as userSchema } from "#models/user.js";
import { schema as dishSchema } from "#models/dish.js";
import {
    schema as orderSchema,
    statusSchema,
    itemSchema as orderItemSchema,
} from "#models/order.js";
/** @typedef {import("zod").infer<typeof userSchema>} User */
/** @typedef {import("zod").infer<typeof import("#models/role.js").schema>} Role */
/** @typedef {import("zod").infer<typeof dishSchema>} Dish */
/** @typedef {import("zod").infer<typeof orderSchema>} Order */

let nextId = 1;

/** @type {User[]} */
const users = [];
/** @type {Dish[]} */
let menu = [];
/** @type {Order[]} */
let orders = [];

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

/**
 * Loads menu using sync read.
 * @returns {void}
 */
function seedMenuSync() {
    const data = fs.readFileSync(
        path.join(import.meta.dirname, "../priv/menu.json"),
        "utf-8"
    );
    menu.push(
        ...z
            .array(dishSchema.omit({ id: true }))
            .parse(JSON.parse(data))
            .map((u) => ({ id: nextId++, ...u }))
    );
}

/**
 * Loads menu using callback.
 * @returns {void}
 */
function seedMenuCallback() {
    fs.readFile(
        path.join(import.meta.dirname, "../priv/menu.json"),
        (err, data) => {
            if (err != null) {
                throw err;
            }

            menu.push(
                ...z
                    .array(dishSchema.omit({ id: true }))
                    .parse(JSON.parse(data.toString()))
                    .map((u) => ({ id: nextId++, ...u }))
            );
        }
    );
}

/**
 * Loads menu using Promises.
 * @returns {Promise<void>}
 */
function seedMenuPromise() {
    return fs.promises
        .readFile(path.join(import.meta.dirname, "../priv/menu.json"), "utf8")
        .then((data) => {
            menu.push(
                ...z
                    .array(dishSchema.omit({ id: true }))
                    .parse(JSON.parse(data.toString()))
                    .map((u) => ({ id: nextId++, ...u }))
            );
        });
}

/**
 * Loads menu using async/await.
 * @returns {Promise<void>}
 */
async function seedMenuAsync() {
    const data = await fs.promises.readFile(
        path.join(import.meta.dirname, "../priv/menu.json"),
        "utf8"
    );

    menu.push(
        ...z
            .array(dishSchema.omit({ id: true }))
            .parse(JSON.parse(data.toString()))
            .map((u) => ({ id: nextId++, ...u }))
    );
}

seedUsersCallback();
seedMenuSync();

// just ignore warnings about unused stuff
[
    seedUsersSync,
    seedUsersAsync,
    seedUsersPromise,
    seedUsersCallback,
    seedMenuCallback,
    seedMenuPromise,
    seedMenuAsync,
    orderSchema,
];

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
 * @param {number} portion - The portion of dish.
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
 * Deletes a dish by its ID.
 * @param {number} id - The ID of dish.
 * @returns {Promise<void>}
 */
export async function deleteMenuItemById(id) {
    menu = menu.filter((dish) => dish.id !== id);
    return;
}

/**
 * Changes info about dish.
 * @param {number} id - The ID of dish.
 * @param {string} name - The name.
 * @param {number} portion - The portion of dish.
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
 * Finds a dish.
 * @param {number} id - The ID of dish.
 * @returns {Promise<Dish|null>} The dish.
 */
export async function findMenuItemById(id) {
    return menu.find((dish) => dish.id === id) || null;
}

/**
 * Creates a new order.
 * @param {number} userId - The ID of the user.
 * @param {Map<number, number> | Record<number, number>} items - The items in the order (dish ID to quantity).
 * @param {string} name - The customer's name.
 * @param {string} address - The delivery address.
 * @param {string} phone - The customer's phone number.
 * @returns {Promise<Order>} The created order.
 */
export async function createOrder(userId, items, name, address, phone) {
    const itemsArray =
        items instanceof Map
            ? Array.from(items.entries())
            : Object.entries(items).map(([id, qty]) => [Number(id), qty]);
    const validatedItems = z
        .array(orderItemSchema)
        .parse(itemsArray.map(([id, quantity]) => ({ id, quantity })));
    const validatedName = z
        .string()
        .min(1, { message: "Name is required." })
        .parse(name);
    const validatedAddress = z
        .string()
        .min(1, { message: "Address is required." })
        .parse(address);
    const validatedPhone = z
        .string()
        .regex(/^\+?\d{10,15}$/, { message: "Invalid phone number." })
        .parse(phone);

    const newOrder = {
        id: nextId++,
        userId,
        items: validatedItems,
        status: "processing",
        name: validatedName,
        address: validatedAddress,
        phone: validatedPhone,
    };

    orders.push(newOrder);
    return newOrder;
}

/**
 * Finds an order by its ID.
 * @param {number} id - The ID of the order.
 * @returns {Promise<Order|null>} The found order or null.
 */
export async function findOrderById(id) {
    return orders.find((order) => order.id === id) || null;
}

/**
 * Finds all orders for a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Order[]>} The user's orders.
 */
export async function findOrdersByUserId(userId) {
    return orders.filter((order) => order.userId === userId);
}

/**
 * Updates an existing order's status, name, address, and phone.
 * @param {number} id - The ID of the order.
 * @param {string} status - The updated status.
 * @returns {Promise<Order|null>} The updated order or null if not found.
 */
export async function updateOrderStatusById(id, status) {
    let order = orders.find((o) => o.id === id) || null;
    if (order == null) {
        return null;
    }

    const validatedStatus = statusSchema.parse(status);

    order.status = validatedStatus;
    return order;
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
    createOrder,
    findOrderById,
    findOrdersByUserId,
    updateOrderStatusById,
};
