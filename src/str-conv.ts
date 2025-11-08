import { ConversionError } from "./errors.js";

/**
 * Converts a string to a boolean value based on common truthy and falsy
 * representations.
 *
 * The function recognises the following values as `true`: "true", "yes", "1", "on".
 * It recognises the following values as `false`: "false", "no", "0", "off".
 *
 * Is case _insensitive_.
 *
 * @param {string} s - The input string to convert to a boolean.
 *
 * @returns {boolean} The boolean output.
 *
 * @throws {ConversionError} Throws an error if the input string does not match
 * any recognised truthy or falsy values.
 *
 * @example
 * ```typescript
 * toBool("true");      // returns true
 * toBool("TRUE");      // returns true
 * toBool("FaLSe");     // returns false
 * toBool("  no  ");    // returns false
 * toBool("no");        // returns false
 * toBool("0");         // returns false
 * toBool("invalid");   // throws ConversionError
 * toBool("");          // throws ConversionError
 * ```
 */
export function toBool(s: string): boolean {
    const truthy = ["true", "yes", "1", "on"];
    const falsy = ["false", "no", "0", "off"];

    const norm = s.toLowerCase().trim();
    if (truthy.includes(norm)) return true;
    if (falsy.includes(norm)) return false;

    throw new ConversionError(s, {
        description: `Value must be one of: ${[...truthy, ...falsy].join(", ")}`,
        sourceType: "string",
        targetType: "boolean",
    });
}

/**
 * Splits a string into an array of trimmed strings based on a specified
 * delimiter. By default, the string is split by commas.
 *
 * @param {string} s - The input string to convert to an array.
 * @param {string} [sep=","] - An optional delimiter.
 *
 * @returns {string[]} An array of trimmed strings split by the specified delimiter.
 *
 * @example
 * ```typescript
 * toArray("apple, banana, cherry");    // returns ["apple", "banana", "cherry"]
 * toArray("dog|cat|bird", "|");        // returns ["dog", "cat", "bird"]
 * ```
 */
export function toArray(s: string, sep: string = ","): string[] {
    try {
        return s.split(sep).map(i => i.trim());
    } catch (error) {
        throw new ConversionError(s, {
            description: `Conversion of "${s}" to an array has failed.`,
            separator: sep,
            sourceType: "string",
            targetType: "string array",
            originalError: error,
        });
    }
}

/**
 * Converts a string to a number. Throws an error if the string is empty or
 * cannot be converted.
 *
 * @param {string} s - The input string to convert to a number.
 *
 * @returns {number} The number output.
 *
 * @throws {ConversionError} Throws an error if the input string cannot be converted
 * to a valid number.
 *
 * @example
 * ```typescript
 * toNumber("  42  ");  // returns 42
 * toNumber("-101.2");  // returns -101.2
 * toNumber("invalid"); // throws ConversionError
 * toNumber("");        // throws ConversionError
 * ```
 */
export function toNumber(s: string): number {
    if (s.length === 0) {
        throw new ConversionError(s, {
            description: `Cannot convert an empty string to a number`,
            sourceType: "string",
            targetType: "number",
        });
    }

    const num = +s;
    if (Number.isNaN(num)) {
        throw new ConversionError(s, {
            description: `Value "${s}" is not a number.`,
            sourceType: "string",
            targetType: "number",
        });
    }

    return num;
}
