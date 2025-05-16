import { z } from "zod";

/** @typedef {z.infer<typeof schema>} Order */

export const statusSchema = z.enum([
    "processing",
    "dispatched",
    "delivered",
    "cancelled",
]);

export const itemSchema = z.object({
    id: z.number().int({ message: "ID must be an integer." }),
    quantity: z
        .number()
        .int()
        .min(1, { message: "Quantity must be at least 1." }),
});

export const schema = z.object({
    id: z.number().int({ message: "ID must be an integer." }),
    userId: z.number().int({ message: "ID must be an integer." }),
    items: z.array(itemSchema),
    status: statusSchema,
    name: z.string().min(1, { message: "Name is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    phone: z
        .string()
        .regex(/^\+?\d{10,15}$/, { message: "Invalid phone number." }),
    createdAt: z.string().datetime({ message: "Invalid datetime format." }),
});

export default {
    schema,
    statusSchema,
    itemSchema,
};
