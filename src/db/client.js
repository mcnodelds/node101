import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "mcnodelds",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
});

export const db = drizzle(pool);

export default { db }
