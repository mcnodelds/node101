import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.js",
    out: "./migrations",
    dbCredentials: {
        host: "postgres",
        port: 5432,
        user: "postgres",
        password: "pass",
        database: "mcnodelds",
        ssl: false,
    },
});
