import { z } from "zod";

/** @typedef {z.infer<typeof schema>} Dish */

export const schema = z.object({
    id: z.number().int({ message: "ID must be an integer." }),
    name: z.string().min(1, { message: "Name is required." }),
    portion: z.number().positive({ message: "Portion must be above 0." }),
    price: z.number().positive({ message: "Price must be above 0." }),
    description: z.string().min(1, { message: "Description is required." }),
    imageurl: z.string().url(),
});

export default {
    schema,
};
