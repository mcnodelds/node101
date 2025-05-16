import { Pool } from "pg";
import { z } from "zod";
import { tryCatch } from "#utils.js";
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

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "mcnodelds",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
});

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<User|null>} The found user or null.
 */
export async function findUserByUsername(username) {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            "SELECT id, username, password_hash, email, role FROM users WHERE username = $1",
            [username]
        );
        const user = result.rows[0];
        if (!user) return null;
        return userSchema.parse({
            id: user.id,
            username: user.username,
            passwordHash: user.password_hash,
            email: user.email,
            role: user.role,
        });
    });
    if (error) throw error;
    return result;
}

/**
 * Finds a user by their ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<User|null>} The found user or null.
 */
export async function findUserById(id) {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            "SELECT id, username, password_hash, email, role FROM users WHERE id = $1",
            [id]
        );
        const user = result.rows[0];
        if (!user) return null;
        return userSchema.parse({
            id: user.id,
            username: user.username,
            passwordHash: user.password_hash,
            email: user.email,
            role: user.role,
        });
    });
    if (error) throw error;
    return result;
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
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            `
            INSERT INTO users (username, password_hash, role, email)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, password_hash, role, email
        `,
            [username, passwordHash, role, email]
        );
        const user = result.rows[0];
        return userSchema.parse({
            id: user.id,
            username: user.username,
            passwordHash: user.password_hash,
            email: user.email,
            role: user.role,
        });
    });
    if (error) throw error;
    return result;
}

/**
 * Returns whole menu
 * @returns {Promise<Dish[]>} The menu itself.
 */
export async function getMenu() {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            "SELECT id, name, portion, price, description, imageurl FROM dishes"
        );
        return z.array(dishSchema).parse(result.rows);
    });
    if (error) throw error;
    return result;
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
export async function createMenuItem(name, portion, price, description, imageurl) {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            `
            INSERT INTO dishes (name, portion, price, description, imageurl)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, portion, price, description, imageurl
        `,
            [name, portion, price, description, imageurl]
        );
        return dishSchema.parse(result.rows[0]);
    });
    if (error) throw error;
    return result;
}

/**
 * Deletes a dish by its ID.
 * @param {number} id - The ID of dish.
 * @returns {Promise<void>}
 */
export async function deleteMenuItemById(id) {
    const { result, error } = await tryCatch(async () => {
        await pool.query("DELETE FROM dishes WHERE id = $1", [id]);
    });
    if (error) throw error;
    return result;
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
export async function updateMenuItemById(id, name, portion, price, description, imageurl) {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            `
            UPDATE dishes
            SET name = $1, portion = $2, price = $3, description = $4, imageurl = $5
            WHERE id = $6
            RETURNING id, name, portion, price, description, imageurl
        `,
            [name, portion, price, description, imageurl, id]
        );
        if (result.rows.length === 0) return null;
        return dishSchema.parse(result.rows[0]);
    });
    if (error) throw error;
    return result;
}

/**
 * Finds a dish by id.
 * @param {number} id - The ID of dish.
 * @returns {Promise<Dish|null>} The dish.
 */
export async function findMenuItemById(id) {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            "SELECT id, name, portion, price, description, imageurl FROM dishes WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) return null;
        return dishSchema.parse(result.rows[0]);
    });
    if (error) throw error;
    return result;
}

/**
 * Finds a dish by name.
 * @param {string} name - The name of dish.
 * @returns {Promise<Dish|null>} The dish.
 */
export async function findMenuItemByName(name) {
    const { result, error } = await tryCatch(async () => {
        const result = await pool.query(
            "SELECT id, name, portion, price, description, imageurl FROM dishes WHERE name = $1",
            [name]
        );
        if (result.rows.length === 0) return null;
        return dishSchema.parse(result.rows[0]);
    });
    if (error) throw error;
    return result;
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
    const { result, error } = await tryCatch(async () => {
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

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const orderResult = await client.query(
                `
                INSERT INTO orders (user_id, status, name, address, phone)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, user_id, status, name, address, phone, created_at
            `,
                [userId, "processing", validatedName, validatedAddress, validatedPhone]
            );
            const order = orderResult.rows[0];

            for (const item of validatedItems) {
                await client.query(
                    `
                    INSERT INTO order_items (order_id, dish_id, quantity)
                    VALUES ($1, $2, $3)
                `,
                    [order.id, item.id, item.quantity]
                );
            }

            const itemsResult = await client.query(
                `
                SELECT dish_id AS id, quantity
                FROM order_items
                WHERE order_id = $1
            `,
                [order.id]
            );

            await client.query("COMMIT");
            return orderSchema.parse({
                id: order.id,
                userId: order.user_id,
                items: itemsResult.rows,
                status: order.status,
                name: order.name,
                address: order.address,
                phone: order.phone,
                createdAt: order.created_at.toISOString(),
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    });
    if (error) throw error;
    return result;
}

/**
 * Returns all orders
 * @returns {Promise<Order[]>} Orders themselves.
 */
export async function getAllOrders() {
    const { result, error } = await tryCatch(async () => {
        const ordersResult = await pool.query(
            "SELECT id, user_id, status, name, address, phone, created_at FROM orders"
        );
        const orders = [];
        for (const order of ordersResult.rows) {
            const itemsResult = await pool.query(
                `
                SELECT dish_id AS id, quantity
                FROM order_items
                WHERE order_id = $1
            `,
                [order.id]
            );
            orders.push(
                orderSchema.parse({
                    id: order.id,
                    userId: order.user_id,
                    items: itemsResult.rows,
                    status: order.status,
                    name: order.name,
                    address: order.address,
                    phone: order.phone,
                    createdAt: order.created_at.toISOString(),
                })
            );
        }
        return orders;
    });
    if (error) throw error;
    return result;
}

/**
 * Finds an order by its ID.
 * @param {number} id - The ID of the order.
 * @returns {Promise<Order|null>} The found order or null.
 */
export async function findOrderById(id) {
    const { result, error } = await tryCatch(async () => {
        const orderResult = await pool.query(
            `
            SELECT id, user_id, status, name, address, phone, created_at
            FROM orders
            WHERE id = $1
        `,
            [id]
        );
        if (orderResult.rows.length === 0) return null;
        const order = orderResult.rows[0];
        const itemsResult = await pool.query(
            `
            SELECT dish_id AS id, quantity
            FROM order_items
            WHERE order_id = $1
        `,
            [order.id]
        );
        return orderSchema.parse({
            id: order.id,
            userId: order.user_id,
            items: itemsResult.rows,
            status: order.status,
            name: order.name,
            address: order.address,
            phone: order.phone,
            createdAt: order.created_at.toISOString(),
        });
    });
    if (error) throw error;
    return result;
}

/**
 * Finds all orders for a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Order[]>} The user's orders.
 */
export async function findOrdersByUserId(userId) {
    const { result, error } = await tryCatch(async () => {
        const ordersResult = await pool.query(
            `
            SELECT id, user_id, status, name, address, phone, created_at
            FROM orders
            WHERE user_id = $1
        `,
            [userId]
        );
        const orders = [];
        for (const order of ordersResult.rows) {
            const itemsResult = await pool.query(
                `
                SELECT dish_id AS id, quantity
                FROM order_items
                WHERE order_id = $1
            `,
                [order.id]
            );
            orders.push(
                orderSchema.parse({
                    id: order.id,
                    userId: order.user_id,
                    items: itemsResult.rows,
                    status: order.status,
                    name: order.name,
                    address: order.address,
                    phone: order.phone,
                    createdAt: order.created_at.toISOString(),
                })
            );
        }
        return orders;
    });
    if (error) throw error;
    return result;
}

/**
 * Updates an existing order's status.
 * @param {number} id - The ID of the order.
 * @param {string} status - The updated status.
 * @returns {Promise<Order|null>} The updated order or null if not found.
 */
export async function updateOrderStatusById(id, status) {
    const { result, error } = await tryCatch(async () => {
        const validatedStatus = statusSchema.parse(status);
        const orderResult = await pool.query(
            `
            UPDATE orders
            SET status = $1
            WHERE id = $2
            RETURNING id, user_id, status, name, address, phone, created_at
        `,
            [validatedStatus, id]
        );
        if (orderResult.rows.length === 0) return null;
        const order = orderResult.rows[0];
        const itemsResult = await pool.query(
            `
            SELECT dish_id AS id, quantity
            FROM order_items
            WHERE order_id = $1
        `,
            [order.id]
        );
        return orderSchema.parse({
            id: order.id,
            userId: order.user_id,
            items: itemsResult.rows,
            status: order.status,
            name: order.name,
            address: order.address,
            phone: order.phone,
            createdAt: order.created_at.toISOString(),
        });
    });
    if (error) throw error;
    return result;
}

export default {
    findUserByUsername,
    findUserById,
    createUser,
    getMenu,
    createMenuItem,
    deleteMenuItemById,
    updateMenuItemById,
    findMenuItemById,
    findMenuItemByName,
    getAllOrders,
    createOrder,
    findOrderById,
    findOrdersByUserId,
    updateOrderStatusById,
};
