import {
    pgTable,
    unique,
    check,
    serial,
    varchar,
    text,
    foreignKey,
    integer,
    timestamp,
    primaryKey,
    pgEnum
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const orderStatusEnum = pgEnum("order_status", [
    "processing",
    "dispatched",
    "delivered",
    "cancelled",
]);

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const users = pgTable(
    "users",
    {
        id: serial().primaryKey().notNull(),
        username: varchar({ length: 32 }).notNull(),
        passwordHash: text("password_hash").notNull(),
        email: varchar({ length: 255 }),
        role: userRoleEnum("role").notNull(),
    },
    (table) => [
        unique("users_username_key").on(table.username),
        check(
            "valid_email",
            sql`(email IS NULL) OR ((email)::text ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'::text)`
        ),
    ]
);

export const orders = pgTable(
    "orders",
    {
        id: serial().primaryKey().notNull(),
        userId: integer("user_id").notNull(),
        status: orderStatusEnum("status").notNull(),
        name: text().notNull(),
        address: text().notNull(),
        phone: text().notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: "orders_user_id_fkey",
        }),
        check("orders_phone_check", sql`phone ~* '^\\+?[0-9]{10,15}$'::text`)
    ]
);

export const dishes = pgTable(
    "dishes",
    {
        id: serial().primaryKey().notNull(),
        name: text().notNull(),
        portion: integer().notNull(),
        price: integer().notNull(),
        description: text().notNull(),
        imageurl: text().notNull(),
    },
    (table) => [
        unique("dishes_name_key").on(table.name),
        check("dishes_portion_check", sql`portion > 0`),
        check("dishes_price_check", sql`price > 0`),
    ]
);

export const orderItems = pgTable(
    "order_items",
    {
        orderId: integer("order_id").notNull(),
        dishId: integer("dish_id").notNull(),
        quantity: integer().notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.orderId],
            foreignColumns: [orders.id],
            name: "order_items_order_id_fkey",
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.dishId],
            foreignColumns: [dishes.id],
            name: "order_items_dish_id_fkey",
        }),
        primaryKey({
            columns: [table.orderId, table.dishId],
            name: "order_items_pkey",
        }),
        check("order_items_quantity_check", sql`quantity >= 1`),
    ]
);
