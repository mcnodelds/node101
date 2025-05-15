import { z } from "zod";

/** @typedef {z.infer<typeof schema>} Order */

export const schema = z.object({
    id: z.number().int({ message: "ID must be an integer." }),
    userId: z.number().int({ message: "ID must be an integer." }),
    items: z.array(
        z.object({
            id: z.number().int({ message: "ID must be an integer." }),
            quantity: z.number().int(),
        })
    ),
});

export default {
    schema,
};
