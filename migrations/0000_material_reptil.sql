CREATE TYPE "public"."order_status" AS ENUM('processing', 'dispatched', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"portion" integer NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"imageurl" text NOT NULL,
	CONSTRAINT "dishes_name_key" UNIQUE("name"),
	CONSTRAINT "dishes_portion_check" CHECK (portion > 0),
	CONSTRAINT "dishes_price_check" CHECK (price > 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_id" integer NOT NULL,
	"dish_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "order_items_pkey" PRIMARY KEY("order_id","dish_id"),
	CONSTRAINT "order_items_quantity_check" CHECK (quantity >= 1)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" "order_status" NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "orders_phone_check" CHECK (phone ~* '^\+?[0-9]{10,15}$'::text)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"password_hash" text NOT NULL,
	"email" varchar(255),
	"role" "user_role" NOT NULL,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "valid_email" CHECK ((email IS NULL) OR ((email)::text ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'::text))
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_dish_id_fkey" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;