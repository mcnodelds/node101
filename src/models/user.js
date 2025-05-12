import { z } from "zod";
import { default as roleSchema } from "#models/role.js";

/** @typedef {z.infer<typeof schema>} User */

export const schema = z.object({
    id: z.number().int({ message: "ID must be an integer." }),
    username: z.string().min(1, { message: "Username is required." }),
    passwordHash: z.string().min(1, { message: "Password hash is required." }),
    email: z
        .string()
        .email({ message: "Invalid email format." })
        .nullable()
        .optional(),
    role: roleSchema,
});

export default {
    schema,
};
