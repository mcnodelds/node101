// src/repo.js
import { db } from "#db/client.js";
import { eq } from "drizzle-orm";
import {
  users,
  dishes,
  orders,
  orderItems,
} from "#db/schema.js";
import userModel from "#models/user.js";
import dishModel from "#models/dish.js";
import { tryCatch } from "#utils.js";

/**
 * @typedef {import("#models/user.js").User} User
 * @typedef {import("#models/dish.js").Dish} Dish
 */

/**
 * Finds a user by username.
 * @param {string} username
 * @returns {Promise<User|null>}
 */
export async function findUserByUsername(username) {
  const { result, error } = await tryCatch(() =>
    db.select().from(users).where(eq(users.username, username))
  );
  if (error != null) throw error;
  const raw = result[0];
  if (!raw) return null;
  return userModel.schema.parse(raw);
}

/**
 * Creates a new user.
 * @param {string} username
 * @param {string} passwordHash
 * @param {string} role
 * @param {string|null|undefined} email
 * @returns {Promise<User>}
 */
export async function createUser(username, passwordHash, role, email) {
  const { result, error } = await tryCatch(() =>
    db
      .insert(users)
      .values({ username, passwordHash, role, email })
      .returning()
  );
  if (error != null) throw error;
  return userModel.schema.parse(result[0]);
}

/**
 * Fetches all dishes (menu items).
 * @returns {Promise<Dish[]>}
 */
export async function getMenu() {
  const { result, error } = await tryCatch(() => db.select().from(dishes));
  if (error != null) throw error;
  return result.map((row) => dishModel.schema.parse(row));
}

/**
 * Finds a dish by ID.
 * @param {number} id
 * @returns {Promise<Dish|null>}
 */
export async function findMenuItemById(id) {
  const { result, error } = await tryCatch(() =>
    db.select().from(dishes).where(eq(dishes.id, id))
  );
  if (error != null) throw error;
  const dish = result[0];
  return dish ? dishModel.schema.parse(dish) : null;
}

/**
 * Finds a dish by name.
 * @param {string} name
 * @returns {Promise<Dish|null>}
 */
export async function findMenuItemByName(name) {
  const { result, error } = await tryCatch(() =>
    db.select().from(dishes).where(eq(dishes.name, name))
  );
  if (error != null) throw error;
  return result[0] ? dishModel.schema.parse(result[0]) : null;
}

/**
 * Creates a new menu item.
 * @param {Omit<Dish, "id">} item
 * @returns {Promise<Dish>}
 */
export async function createMenuItem(item) {
  const parsed = dishModel.schema.omit({ id: true }).parse(item);
  const { result, error } = await tryCatch(() =>
    db.insert(dishes).values(parsed).returning()
  );
  if (error != null) throw error;
  return dishModel.schema.parse(result[0]);
}

/**
 * Updates a menu item.
 * @param {number} id
 * @param {Partial<Omit<Dish, "id">>} updates
 * @returns {Promise<Dish>}
 */
export async function updateMenuItemById(id, updates) {
  const { result, error } = await tryCatch(() =>
    db.update(dishes).set(updates).where(eq(dishes.id, id)).returning()
  );
  if (error != null) throw error;
  return dishModel.schema.parse(result[0]);
}

/**
 * Deletes a menu item by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteMenuItemById(id) {
  const { error } = await tryCatch(() =>
    db.delete(dishes).where(eq(dishes.id, id))
  );
  if (error != null) throw error;
}

/**
 * Gets all orders. Returns raw rows for now.
 */
export async function getAllOrders() {
  const { result, error } = await tryCatch(() => db.select().from(orders));
  if (error != null) throw error;
  return result;
}

/**
 * Creates a new order.
 * @param {number} userId
 * @param {Record<number, number>} items
 * @param {string} name
 * @param {string} address
 * @param {string} phone
 * @returns {Promise<any>} Order row
 */
export async function createOrder(userId, items, name, address, phone) {
  const { result: orderRes, error: orderErr } = await tryCatch(() =>
    db.insert(orders).values({
      userId,
      name,
      address,
      phone,
      status: "pending",
    }).returning()
  );
  if (orderErr != null) throw orderErr;

  const order = orderRes[0];
  const itemValues = Object.entries(items).map(([dishId, quantity]) => ({
    orderId: order.id,
    dishId: Number(dishId),
    quantity,
  }));

  const { error: itemsErr } = await tryCatch(() =>
    db.insert(orderItems).values(itemValues)
  );
  if (itemsErr != null) throw itemsErr;

  return order;
}

/**
 * Finds an order by ID.
 * @param {number} id
 * @returns {Promise<any|null>}
 */
export async function findOrderById(id) {
  const { result, error } = await tryCatch(() =>
    db.select().from(orders).where(eq(orders.id, id))
  );
  if (error != null) throw error;
  return result[0] || null;
}

/**
 * Gets orders for a specific user.
 * @param {number} userId
 * @returns {Promise<any[]>}
 */
export async function findOrdersByUserId(userId) {
  const { result, error } = await tryCatch(() =>
    db.select().from(orders).where(eq(orders.userId, userId))
  );
  if (error != null) throw error;
  return result;
}

/**
 * Updates the status of an order.
 * @param {number} id
 * @param {string} status
 * @returns {Promise<any>}
 */
export async function updateOrderStatusById(id, status) {
  const { result, error } = await tryCatch(() =>
    db.update(orders).set({ status }).where(eq(orders.id, id)).returning()
  );
  if (error != null) throw error;
  return result[0];
}

export default {
  findUserByUsername,
  createUser,
  getMenu,
  findMenuItemById,
  findMenuItemByName,
  createMenuItem,
  updateMenuItemById,
  deleteMenuItemById,
  getAllOrders,
  createOrder,
  findOrderById,
  findOrdersByUserId,
  updateOrderStatusById,
};
