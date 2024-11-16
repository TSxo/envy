import type { AssertFn } from "../types.js";
import { create } from "./create.js";

/**
 * Asserts that a given `ArrayLike` object has an exact length.
 *
 * @param {number} n - The exact length.
 *
 * @returns {AssertFn<ArrayLike<T>>} A function that asserts the provided
 * `ArrayLike` object is of an exact length.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const url = envy.required("MY_URL")
 *     .assert(assert.len(20))
 *     .build();
 * ```
 */
export function len<T>(n: number): AssertFn<ArrayLike<T>> {
    const fn = <T>(v: ArrayLike<T>) => v.length === n;

    return create(fn, {
        description: `Must have a length of: ${n}`,
        allowedLength: n,
    });
}

/**
 * Asserts that a given `ArrayLike` object is of a minimum length.
 *
 * @param {number} n - The minimum length.
 *
 * @returns {AssertFn<ArrayLike<T>>} A function that asserts the provided
 * `ArrayLike` object is of a minimum length.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const url = envy.required("MY_URL")
 *     .assert(assert.minLen(20))
 *     .build();
 * ```
 */
export function minLen<T>(n: number): AssertFn<ArrayLike<T>> {
    const fn = <T>(v: ArrayLike<T>) => v.length >= n;
    return create(fn, {
        description: `Must have a minimum length of: ${n}`,
        minimumLength: n,
    });
}

/**
 * Asserts that a given `ArrayLike` object is of a maximum length.
 *
 * @param {number} n - The maximum length.
 *
 * @returns {AssertFn<ArrayLike<T>>} A function that asserts the provided
 * `ArrayLike` object is of a maximum length.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const url = envy.required("MY_URL")
 *     .assert(assert.maxLen(20))
 *     .build();
 * ```
 */
export function maxLen<T>(n: number): AssertFn<ArrayLike<T>> {
    const fn = <T>(v: ArrayLike<T>) => v.length <= n;
    return create(fn, {
        description: `Must have a maximum length of: ${n}`,
        maximumLength: n,
    });
}
