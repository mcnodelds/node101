import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { z } from "zod";
import { schema as userSchema } from "#models/user.js";
import { schema as dishSchema } from "#models/dish.js";
import { tryCatch } from "#utils.js";

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "mcnodelds",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
});

const insertUserQuery = `
INSERT INTO users (username, password_hash, email, role)
VALUES ($1, $2, $3, $4)
ON CONFLICT (username) DO NOTHING
`;

/**
 * Seed users with data
 * @returns {Promise<void>}
 */
async function seedUsers() {
    const data = await fs.readFile(
        path.join(import.meta.dirname, "../priv/users.json"),
        "utf8"
    );
    const users = z
        .array(userSchema.omit({ id: true }))
        .parse(JSON.parse(data));

    const client = await pool.connect();
    const { error } = await tryCatch(async () => {
        await client.query("BEGIN");
        for (const user of users) {
            await client.query(insertUserQuery, [
                user.username,
                user.passwordHash,
                user.email,
                user.role,
            ]);
        }
        await client.query("COMMIT");
        console.log("Users seeded successfully");
    });
    if (error != null) {
        await client.query("ROLLBACK");
        console.error("Error seeding users:", error);
    }

    client.release();
}

const insertDishQuery = `
INSERT INTO dishes (name, portion, price, description, imageurl)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (name) DO NOTHING
`;

/**
 * Seed menu with data
 * @returns {Promise<void>}
 */
async function seedMenu() {
    const data = await fs.readFile(
        path.join(import.meta.dirname, "../priv/menu.json"),
        "utf8"
    );

    const dishes = z
        .array(dishSchema.omit({ id: true }))
        .parse(JSON.parse(data));

    const client = await pool.connect();
    const { error } = await tryCatch(async () => {
        await client.query("BEGIN");
        for (const dish of dishes) {
            await client.query(insertDishQuery, [
                dish.name,
                dish.portion,
                dish.price,
                dish.description,
                dish.imageurl,
            ]);
        }
        await client.query("COMMIT");
        console.log("Menu seeded successfully");
    });

    if (error != null) {
        await client.query("ROLLBACK");
        console.error("Error seeding menu:", error);
    }

    client.release();
}

/**
 * Main part of script
 * @returns {Promise<void>}
 */
async function main() {
    await seedUsers();
    await seedMenu();
    console.log("Seeding completed");
    await pool.end();
}

main();
