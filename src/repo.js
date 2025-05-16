import { z } from "zod";
import { tryCatch } from "#utils.js";
import { schema as userSchema } from "#models/user.js";
import { schema as dishSchema } from "#models/dish.js";
import {
    schema as orderSchema,
    statusSchema,
    itemSchema as orderItemSchema,
} from "#models/order.js";
import { users, orders, orderItems, dishes } from "#db/schema.js";
import { db } from "#db/client.js";
import { eq } from "drizzle-orm";

/** @typedef {import("zod").infer<typeof userSchema>} User */
/** @typedef {import("zod").infer<typeof import("#models/role.js").schema>} UserRole */
/** @typedef {import("zod").infer<typeof dishSchema>} Dish */
/** @typedef {import("zod").infer<typeof import("#models/order.js").statusSchema>} OrderStatus */
/** @typedef {import("zod").infer<typeof orderSchema>} Order */

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<User|null>} The found user or null.
 */
export async function findUserByUsername(username) {
    const { result, error } = await tryCatch(async () => {
        const result = await db
            .select({
                id: users.id,
                username: users.username,
                passwordHash: users.passwordHash,
                email: users.email,
                role: users.role,
            })
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        const user = result[0];
        if (!user) return null;
        return userSchema.parse(user);
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
        const result = await db
            .select({
                id: users.id,
                username: users.username,
                passwordHash: users.passwordHash,
                email: users.email,
                role: users.role,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        const user = result[0];
        if (!user) return null;
        return userSchema.parse(user);
    });
    if (error) throw error;
    return result;
}

/**
 * Creates a new user.
 * @param {string} username - The username.
 * @param {string} passwordHash - The hashed password.
 * @param {UserRole} role - The user's role.
 * @param {string|null} [email] - The user's email (optional).
 * @returns {Promise<User>} The created user.
 */
export async function createUser(username, passwordHash, role, email = null) {
    const { result, error } = await tryCatch(async () => {
        const result = await db.transaction(async (tx) =>
            tx
                .insert(users)
                .values({
                    username,
                    passwordHash,
                    role: role,
                    email,
                })
                .returning({
                    id: users.id,
                    username: users.username,
                    passwordHash: users.passwordHash,
                    email: users.email,
                    role: users.role,
                })
        )

        const user = result[0];
        return userSchema.parse(user);
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
        const result = await db
            .select({
                id: dishes.id,
                name: dishes.name,
                portion: dishes.portion,
                price: dishes.price,
                description: dishes.description,
                imageurl: dishes.imageurl,
            })
            .from(dishes);

        return z.array(dishSchema).parse(result);
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
        const result = await db.transaction(async (tx) =>
            tx
                .insert(dishes)
                .values({
                    name,
                    portion,
                    price,
                    description,
                    imageurl,
                })
                .returning({
                    id: dishes.id,
                    name: dishes.name,
                    portion: dishes.portion,
                    price: dishes.price,
                    description: dishes.description,
                    imageurl: dishes.imageurl,
                })
        );

        return dishSchema.parse(result[0]);
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
        await db.transaction(async (tx) => tx.delete(dishes).where(eq(dishes.id, id)));
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
        const result = await db.transaction(async (tx) =>
            tx
                .update(dishes)
                .set({
                    name,
                    portion,
                    price,
                    description,
                    imageurl,
                })
                .where(eq(dishes.id, id))
                .returning({
                    id: dishes.id,
                    name: dishes.name,
                    portion: dishes.portion,
                    price: dishes.price,
                    description: dishes.description,
                    imageurl: dishes.imageurl,
                })
        );

        if (result.length === 0) return null;
        return dishSchema.parse(result[0]);
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
        const result = await db
            .select({
                id: dishes.id,
                name: dishes.name,
                portion: dishes.portion,
                price: dishes.price,
                description: dishes.description,
                imageurl: dishes.imageurl,
            })
            .from(dishes)
            .where(eq(dishes.id, id))
            .limit(1);

        if (result.length === 0) return null;
        return dishSchema.parse(result[0]);
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
        const result = await db
            .select({
                id: dishes.id,
                name: dishes.name,
                portion: dishes.portion,
                price: dishes.price,
                description: dishes.description,
                imageurl: dishes.imageurl,
            })
            .from(dishes)
            .where(eq(dishes.name, name))
            .limit(1);

        if (result.length === 0) return null;
        return dishSchema.parse(result[0]);
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

        return await db.transaction(async (tx) => {
            const orderResult = await tx
                .insert(orders)
                .values({
                    userId,
                    status: "processing",
                    name: validatedName,
                    address: validatedAddress,
                    phone: validatedPhone,
                })
                .returning({
                    id: orders.id,
                    userId: orders.userId,
                    status: orders.status,
                    name: orders.name,
                    address: orders.address,
                    phone: orders.phone,
                    createdAt: orders.createdAt,
                });

            const order = orderResult[0];

            for (const item of validatedItems) {
                await tx.insert(orderItems).values({
                    orderId: order.id,
                    dishId: item.id,
                    quantity: item.quantity,
                });
            }

            const itemsResult = await tx
                .select({
                    id: orderItems.dishId,
                    quantity: orderItems.quantity,
                })
                .from(orderItems)
                .where(eq(orderItems.orderId, order.id));

            return orderSchema.parse({
                id: order.id,
                userId: order.userId,
                items: itemsResult,
                status: order.status,
                name: order.name,
                address: order.address,
                phone: order.phone,
                createdAt: order.createdAt,
            });
        });
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
        const ordersResult = await db
            .select({
                id: orders.id,
                userId: orders.userId,
                status: orders.status,
                name: orders.name,
                address: orders.address,
                phone: orders.phone,
                createdAt: orders.createdAt,
            })
            .from(orders);

        const ordersData = [];
        for (const order of ordersResult) {
            const itemsResult = await db
                .select({
                    id: orderItems.dishId,
                    quantity: orderItems.quantity,
                })
                .from(orderItems)
                .where(eq(orderItems.orderId, order.id));

            ordersData.push(
                orderSchema.parse({
                    id: order.id,
                    userId: order.userId,
                    items: itemsResult,
                    status: order.status,
                    name: order.name,
                    address: order.address,
                    phone: order.phone,
                    createdAt: order.createdAt.toISOString(),
                })
            );
        }
        return ordersData;
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
        const orderResult = await db
            .select({
                id: orders.id,
                userId: orders.userId,
                status: orders.status,
                name: orders.name,
                address: orders.address,
                phone: orders.phone,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .where(eq(orders.id, id))
            .limit(1);

        if (orderResult.length === 0) return null;
        const order = orderResult[0];

        const itemsResult = await db
            .select({
                id: orderItems.dishId,
                quantity: orderItems.quantity,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

        return orderSchema.parse({
            id: order.id,
            userId: order.userId,
            items: itemsResult,
            status: order.status,
            name: order.name,
            address: order.address,
            phone: order.phone,
            createdAt: order.createdAt.toISOString(),
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
        const ordersResult = await db
            .select({
                id: orders.id,
                userId: orders.userId,
                status: orders.status,
                name: orders.name,
                address: orders.address,
                phone: orders.phone,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .where(eq(orders.userId, userId));

        const ordersData = [];
        for (const order of ordersResult) {
            const itemsResult = await db
                .select({
                    id: orderItems.dishId,
                    quantity: orderItems.quantity,
                })
                .from(orderItems)
                .where(eq(orderItems.orderId, order.id));

            ordersData.push(
                orderSchema.parse({
                    id: order.id,
                    userId: order.userId,
                    items: itemsResult,
                    status: order.status,
                    name: order.name,
                    address: order.address,
                    phone: order.phone,
                    createdAt: order.createdAt.toISOString(),
                })
            );
        }
        return ordersData;
    });
    if (error) throw error;
    return result;
}

/**
 * Updates an existing order's status.
 * @param {number} id - The ID of the order.
 * @param {OrderStatus} status - The updated status.
 * @returns {Promise<Order|null>} The updated order or null if not found.
 */
export async function updateOrderStatusById(id, status) {
    const { result, error } = await tryCatch(async () => {
        const validatedStatus = statusSchema.parse(status);
        const orderResult = await db.transaction(async (tx) =>
            tx
                .update(orders)
                .set({ status: validatedStatus })
                .where(eq(orders.id, id))
                .returning({
                    id: orders.id,
                    userId: orders.userId,
                    status: orders.status,
                    name: orders.name,
                    address: orders.address,
                    phone: orders.phone,
                    createdAt: orders.createdAt,
                })
        );

        if (orderResult.length === 0) return null;
        const order = orderResult[0];

        const itemsResult = await db
            .select({
                id: orderItems.dishId,
                quantity: orderItems.quantity,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

        return orderSchema.parse({
            id: order.id,
            userId: order.userId,
            items: itemsResult,
            status: order.status,
            name: order.name,
            address: order.address,
            phone: order.phone,
            createdAt: order.createdAt.toISOString(),
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
