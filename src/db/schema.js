import { pgTable, unique, check, serial, varchar, text, foreignKey, integer, timestamp, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 32 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	email: varchar({ length: 255 }),
	role: varchar({ length: 50 }).notNull(),
}, (table) => [
	unique("users_username_key").on(table.username),
	check("users_role_check", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])`),
	check("valid_email", sql`(email IS NULL) OR ((email)::text ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'::text)`),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	status: varchar({ length: 50 }).notNull(),
	name: text().notNull(),
	address: text().notNull(),
	phone: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_fkey"
		}),
	check("orders_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'dispatched'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])`),
	check("orders_phone_check", sql`phone ~* '^\+?\d{10,15}$'::text`),
]);

export const dishes = pgTable("dishes", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	portion: integer().notNull(),
	price: integer().notNull(),
	description: text().notNull(),
	imageurl: text().notNull(),
}, (table) => [
	unique("dishes_name_key").on(table.name),
	check("dishes_portion_check", sql`portion > 0`),
	check("dishes_price_check", sql`price > 0`),
]);

export const orderItems = pgTable("order_items", {
	orderId: integer("order_id").notNull(),
	dishId: integer("dish_id").notNull(),
	quantity: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dishId],
			foreignColumns: [dishes.id],
			name: "order_items_dish_id_fkey"
		}),
	primaryKey({ columns: [table.orderId, table.dishId], name: "order_items_pkey"}),
	check("order_items_quantity_check", sql`quantity >= 1`),
]);
