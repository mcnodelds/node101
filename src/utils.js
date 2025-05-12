/**
 * @template T
 * @typedef {Object} ResultSuccess
 * @property {T} result - The result of the function/promise.
 * @property {null} error - Null if the function/promise was successful.
 */

/**
 * @template T
 * @typedef {Object} ResultFailure
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
 * 
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

export default {
    tryCatch,
}
