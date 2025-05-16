import { relations } from "drizzle-orm/relations";
import { users, orders, orderItems, dishes } from "#db/schema.js";

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    dish: one(dishes, {
        fields: [orderItems.dishId],
        references: [dishes.id],
    }),
}));

export const dishesRelations = relations(dishes, ({ many }) => ({
    orderItems: many(orderItems),
}));
