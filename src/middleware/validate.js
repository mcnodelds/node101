/**
 * Middleware to validate request body against a Zod schema.
 * @param {import("zod").ZodSchema} schema - the schema that body is matched on
 * @returns {import("express").Handler} - the handler express will execute
 */
export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Invalid request data",
                errors: result.error.flatten(),
            });
            return;
        }

        req.body = result.data;
        next();
    };
}
