import type { AssertFn } from "../types.js";
import { create } from "./create.js";

/**
 * Validates whether a given string is a valid URL and optionally checks
 * if it uses one of the specified protocols.
 *
 * @param {string[]} [protocols] - An optional array of acceptable URL protocols
 * (e.g., ["http:", "https:"]). If provided, the function will check if the
 * validated URL uses one of these protocols.
 *
 * @returns {AssertFn<string>} A function that asserts the provided string is a
 * valid URL, conforming to the specified protocols if any.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const url = envy.required("MY_URL")
 *     .assert(assert.isURL(["https:"]))
 *     .build();
 * ```
 */
export function isURL(protocols?: string[]): AssertFn<string> {
    let d = "Must be a valid URL";
    if (protocols !== undefined && protocols.length > 0) {
        d += ` and use one of the following protocols: ${protocols.join(", ")}`;
    }

    const fn = function (v: string): boolean {
        try {
            const url = new URL(v);
            if (protocols !== undefined && protocols.length > 0) {
                return protocols.includes(url.protocol);
            }
            return true;
        } catch (_) {
            return false;
        }
    };

    return create(fn, {
        description: d,
        acceptedProtocols: protocols,
    });
}

/**
 * Validates whether a given number is within the range of 1 to 65535 (inclusive).
 *
 * @returns {AssertFn<number>} A function that asserts the input number is
 * within the valid port range (1-65535).
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const port = envy.number("PORT")
 *     .assert(isPort())
 *     .build();
 * ```
 */
export function isPort(): AssertFn<number> {
    return create((v: number): boolean => v > 0 && v <= 65535, {
        description: "Port must be between 1 and 65535",
        min: 1,
        max: 65535,
    });
}
