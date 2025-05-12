/**
 * @template T
 * @typedef {object} ResultSuccess
 * @property {T} result - The result of the function/promise.
 * @property {null} error - Null if the function/promise was successful.
 */

/**
 * @template T
 * @typedef {object} ResultFailure
 * @property {null} result - Null if there was an error.
 * @property {Error} error - The error object if the function/promise failed.
 */

/**
 * @template T
 * @typedef {ResultSuccess<T> | ResultFailure<T>} Result
 */

/**
 * Wraps a function call and returns a tuple [result, error].
 * Works with both sync and async functions.
 * @template T
 * @param {() => Promise<T> | T} fn - The function to execute.
 * @returns {Promise<Result<T>>}
 */
export async function tryCatch(fn) {
    try {
        const result = await fn();
        return { result, error: null };
    } catch (error) {
        if (!(error instanceof Error)) {
            return {
                result: null,
                error: new Error(`Non-error thrown: ${JSON.stringify(error)}`),
            };
        }

        return { result: null, error };
    }
}

/**
 * @typedef {import('express').Request & { context?: Record<string, any> }} RequestWithContext
 */

/**
 * Key-specific types for `context` values.
 * @typedef {object} ContextData
 * @property {import("#controllers/auth.js").JwtPayload} user
 */

/**
 * Attach arbitrary data to the request object under the `context` key.
 * The type of the value is inferred based on the key.
 * @param {import('express').Request} req - The Express request object.
 * @param {keyof ContextData} key - The key under which the value will be attached.
 * @param {ContextData[keyof ContextData]} value - The value to attach to the request object.
 */
export function attach(req, key, value) {
    /** @type {RequestWithContext} */
    const r = req;

    // Initialize context if it doesn't exist
    if (!r.context) {
        r.context = {};
    }

    // Assign the value to the context for the given key
    r.context[key] = value;
}

/**
 * Retrieve data associated with a key from the request object's `context`.
 * The type of the returned value is inferred based on the key.
 * @param {import('express').Request} req - The Express request object.
 * @param {keyof ContextData} key - The key associated with the data.
 * @returns {ContextData[keyof ContextData] | undefined} - The data associated with the key, or `undefined` if not found.
 */
export function lookup(req, key) {
    /** @type {RequestWithContext} */
    const r = req;

    if (r.context && r.context[key] !== undefined) {
        return r.context[key]; // Return the value for the given key
    }

    return undefined;
}

export default {
    tryCatch,
    attach,
    lookup,
};
