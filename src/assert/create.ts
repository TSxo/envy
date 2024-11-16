import type { AssertFn, FnCtx } from "../types.js";

/**
 * Creates an assertion function that validates a given value against a
 * predicate, and includes additional metadata such as a description and
 * optional context.
 *
 * @template T - The type of the value being asserted.
 *
 * @param predicate - A function that accepts a value of type `T` and returns a
 * boolean indicating whether the assertion passes or fails.
 *
 * @param message - A message that provides additional information about the assertion.
 *
 * @param [context] - Optional context that can contain metadata for error handling or debugging.
 *
 * @returns An `AssertFn` function that can be used to assert values of type `T`.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const myAssert = assert.create((v: number): boolean => v > 0 && v <= 65535, {
 *       description: "Port must be between 1 and 65535",
 *       min: 1,
 *       max: 65535,
 *   });
 *
 * const port = envy.number("PORT")
 *     .assert(myAssert())
 *     .build();
 * ```
 */
export function create<T = unknown>(
    predicate: (value: T) => boolean,
    context?: FnCtx,
): AssertFn<T> {
    const assertFn = Object.assign(predicate, { context });
    return assertFn;
}
