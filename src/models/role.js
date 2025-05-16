import { z } from "zod";

/** @typedef {z.infer<typeof schema>} UserRole */

export const schema = z.enum(["user", "admin"]);

export default schema;
