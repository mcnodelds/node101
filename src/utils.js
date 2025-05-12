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
 * Wraps a function call and returns a result object
 * Works with both sync and async functions.
 * @template T
 * @param {() => Promise<T> | T} fn - The function to execute.
 * @returns {Promise<Result<T>>} - Result object
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
 * Key-specific types for `context` values.
 * @typedef {object} ContextData
 * @property {import("#controllers/auth.js").AuthClaims} claims - claims payload
 */

/**
 * @typedef {
    import('express').Request & {context?: {[key: string]: any}}
 } RequestWithContext
 */

/**
 * Attach arbitrary data to the request object under the `context` key.
 * The type of the value is inferred based on the key.
 * @template {keyof ContextData} K
 * @param {import('express').Request} req - The Express request object.
 * @param {K} key - The key under which the value will be attached.
 * @param {ContextData[K]} value - The value to attach to the request object.
 */
export function attach(req, key, value) {
    /** @type {RequestWithContext} */
    const r = req;

    r.context = r.context || {};

    r.context[key] = value;
    return;
}

/**
 * Retrieve data associated with a key from the request object's `context`.
 * The type of the returned value is inferred based on the key.
 * @template {keyof ContextData} K
 * @param {import('express').Request} req - The Express request object.
 * @param {K} key - The key associated with the data.
 * @returns {ContextData[K] | undefined} - The data associated with the key, or `undefined` if not found.
 */
export function lookup(req, key) {
    /** @type {RequestWithContext} */
    const r = req;

    return r?.context?.[key];
}

export default {
    tryCatch,
    attach,
    lookup,
};
