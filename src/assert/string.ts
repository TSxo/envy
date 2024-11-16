import type { AssertFn } from "../types.js";
import { create } from "./create.js";

/**
 * Asserts a string has a given prefix.
 *
 * @param {string} s - The prefix.
 *
 * @returns {AssertFn<string>} A function that asserts a string has a given
 * prefix.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const env = envy.required("ENV")
 *     .assert(assert.prefix("DEV_"))
 *     .build();
 * ```
 */
export function prefix(s: string): AssertFn<string> {
    return create((v: string): boolean => v.startsWith(s), {
        description: `Must have a prefix of: ${s}`,
        prefix: s,
    });
}

/**
 * Asserts a string has a given suffix.
 *
 * @param {string} s - The suffix.
 *
 * @returns {AssertFn<string>} A function that asserts a string has a given
 * suffix.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const env = envy.required("ENV")
 *     .assert(assert.suffix("_DEV"))
 *     .build();
 * ```
 */
export function suffix(s: string): AssertFn<string> {
    return create((v: string): boolean => v.endsWith(s), {
        description: `Must have a suffix of: ${s}`,
        suffix: s,
    });
}

/**
 * Asserts a string contains a given substring.
 *
 * @param {number} s - The substring.
 *
 * @returns {AssertFn<string>} A function that asserts a string contains a given
 * substring.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const url = envy.required("MY_URL")
 *     .assert(assert.substring("id="))
 *     .build();
 * ```
 */
export function substring(s: string): AssertFn<string> {
    return create((v: string): boolean => v.includes(s), {
        description: `Must contain: ${s}`,
        substring: s,
    });
}

/**
 * Asserts a string matches a given regular expression.
 *
 * @param {RegExp} rx - The regular expression to match against.
 *
 * @returns {AssertFn<string>} A function that asserts a string matches a given
 * regular expression.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const url = envy.required("MY_URL")
 *     .assert(assert.matches(/^https:/))
 *     .build();
 * ```
 */
export function matches(rx: RegExp): AssertFn<string> {
    return create((s: string): boolean => rx.test(s), {
        description: `Must match: ${rx.source}`,
        regex: rx.source,
    });
}

/**
 * Asserts a given string is one of the permitted values.
 *
 * @param {string[]} opts - The permitted values.
 *
 * @returns {AssertFn<string>} A function that asserts a string matches one of
 * the permitted values.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const env = envy.required("ENV")
 *     .assert(assert.options(["dev", "staging", "prod", "test"])
 *     .build();
 * ```
 */
export function options(opts: string[]): AssertFn<string> {
    return create((v: string): boolean => opts.includes(v), {
        description: `Must be one of: ${opts.join(", ")}`,
        options: opts,
    });
}
