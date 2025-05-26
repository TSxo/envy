import type {
    AssertFn,
    TransformFn,
    ConvertFn,
    ErrCtx,
    NarrowFn,
} from "./types.js";
import { AssertError, MissingError } from "./errors.js";
import { toArray, toBool, toNumber } from "./str-conv.js";
import { minLen } from "./assert/array-like.js";

/**
 * # Description
 *
 * Class for handling environment variables with validation, transformation,
 * and conversion. Provides a simple interface for building type-safe
 * environment variable configurations.
 *
 * # Features
 *
 * - Assertions
 * - Type conversion
 * - Value transformation
 * - Method chaining
 *
 * # Errors
 *
 * If the environment variable is not available and no default was provided,
 * an error will be thrown.
 *
 * If any of the assertions fail, an error will be thrown.
 *
 * If an environment variable is available and fails a validation check, the
 * default value (if provided) _will not be used_. It is assumed that if an
 * environment value was explicitly set, then there was a reason for overriding
 * the default and execution should cease.
 *
 * @example
 * ```typescript
 * import { envy, assert, strConv } from "@tsxo/envy";
 *
 * const port = envy.required("PORT")
 *   .transform(s => s.trim())
 *   .convert(strConv.toNumber)
 *   .assert(assert.isPort())
 *   .build();
 * ```
 */
class Envy<T> {
    /** The environment variable key. */
    private _key: string;

    /** The current environment value. */
    private _value: T;

    /**
     * Creates an instance of Envy. Created internally.
     *
     * @param {string}  key - The original env var key
     * @param {T}       value - The converted value
     */
    constructor(key: string, value: T) {
        this._key = key;
        this._value = value;
    }

    /**
     * Applies a transformation function to the value.
     *
     * @param {TransformFn<T>} fn - A transformation function.
     *
     * @returns This instance for method chaining.
     *
     * @example
     * ```typescript
     * import { envy, strConv } from "@tsxo/envy";
     *
     * const num = envy.required("MY_NUM")
     *   .convert(strConv.toNumber)
     *   .transform(n => n * 2)  // Doubles the number
     *   .build();
     * ```
     */
    public transform(fn: TransformFn<T>): this {
        this._value = fn(this._value);
        return this;
    }

    /**
     * Narrows the type of the current value using a type guard function.
     *
     * @template N The narrowed type.
     *
     * @param {NarrowFn} fn - Type guard function.
     * @param {string} [msg] - Optional error message if narrowing fails.
     *
     * @returns {Envy<N>} A new Envy instance with the narrowed type.
     *
     * @throws {AssertError} If the type narrowing fails.
     *
     * @example
     * ```typescript
     * type Region = "us-east-1" | "us-west-2";
     *
     * function isRegion(val: string): val is Region {
     *   return val === "us-east-1" || val === "us-west-2";
     * }
     *
     * const region = envy.required("AWS_REGION")
     *   .narrow(isRegion, "Invalid AWS region")
     *   .build(); // region is now typed as Region instead of string
     * ```
     */
    public narrow<N extends T>(fn: NarrowFn<T, N>, msg?: string): Envy<N> {
        if (!fn(this._value)) {
            const ctx: ErrCtx = { description: "Failed type-narrowing" };
            if (msg) ctx.userMessage = msg;

            throw new AssertError(this._key, this._value, ctx);
        }

        return this as unknown as Envy<N>;
    }

    /**
     * Validates the current value using a predicate function.
     *
     * The assertion function should return true if the value is valid and false
     * otherwise. If validation fails, an error is thrown.
     *
     * @param {AssertFn<T>} fn - Predicate function.
     * @param {string} msg - An optional user-defined message.
     *
     * @returns This instance for method chaining.
     *
     * @throws {AssertError} If the validation fails.
     * @throws {MissingError} If no value is available and no default was provided.
     *
     * @example
     * ```typescript
     * import { envy, assert, strConv } from "@tsxo/envy";
     *
     * const port = envy.required("PORT")
     *   .assert(val => val.length > 0, "Length must be greater than zero")
     *   .convert(strConv.toNumber)
     *   .assert(assert.isPort())
     *   .build();
     * ```
     */
    public assert(fn: AssertFn<T>, msg?: string): this {
        const valid = fn(this._value);

        if (!valid) {
            const ctx: ErrCtx = fn.context || {};
            if (msg) ctx.userMessage = msg;

            throw new AssertError(this._key, this._value, ctx);
        }

        return this;
    }

    /**
     * Converts the current value to another type using the provided function.
     *
     * @template O The type to convert to.
     *
     * @param {ConvertFn<T, O>} fn - Function that converts from type T to type O.
     *
     * @returns {Envy<O>} A new Envy instance with the converted value.
     *
     * @example
     *
     * ```typescript
     * import { envy, strConv } from "@tsxo/envy";
     *
     * const port = envy.required("PORT")
     *   .convert(Number)           // Convert to number
     *   .convert(n => String(n))   // Convert to string
     *   .convert(strConv.toNumber) // Convert to number
     *   .build();
     * ```
     */
    public convert<O>(fn: ConvertFn<T, O>): Envy<O> {
        const converted = fn(this._value);
        return new Envy<O>(this._key, converted);
    }

    /**
     * Returns the final value.
     *
     * @returns {T} The final value of type T.
     *
     * @example
     *
     * ```typescript
     * import { envy, assert, strConv } from "@tsxo/envy";
     *
     * const port = envy.required("PORT")
     *   .convert(strConv.toNumber)
     *   .assert(assert.isPort())
     *   .build();  // Returns a number
     * ```
     */
    public build(): T {
        return this._value;
    }
}

/**
 * Creates a required environment variable configuration that must have a
 * non-empty value.
 *
 * Will automatically trim the string value.
 *
 * @param {string} key - The environment variable key to read from `process.env`.
 *
 * @returns {Envy<string>} A new Envy instance.
 *
 * @throws {MissingError} If no value is available.
 * @throws {AssertError} If the value is an empty string.
 *
 * @example
 * ```typescript
 * import { envy, assert, strConv } from "@tsxo/envy";
 *
 * const port = envy.required("PORT")
 *   .convert(strConv.toNumber)
 *   .assert(assert.isPort())
 *   .build();
 * ```
 */
export function required(key: string): Envy<string> {
    const env = process.env[key];
    if (env === undefined) throw new MissingError(key);
    return new Envy(key, env).transform(s => s.trim()).assert(minLen(1));
}

/**
 * Creates an optional environment variable configuration.
 *
 * @param {string} key - The environment variable key to read from `process.env`.
 * @param {string} defaultValue - Required default value.
 *
 * @returns {Envy<string>} A new Envy instance.
 *
 * @throws {MissingError} If no value is available and no default value was provided.
 * @throws {AssertError} If the value is an empty string.
 *
 * @example
 * ```typescript
 * import { envy, assert } from "@tsxo/envy";
 *
 * const region = envy.optional("AWS_REGION", "us-east-1")
 *   .assert(assert.minLen(1))
 *   .assert(assert.prefix("us-"))
 *   .build();
 * ```
 */
export function optional(key: string, defaultValue: string): Envy<string> {
    let env = process.env[key];
    if (env === undefined) env = defaultValue;
    return new Envy(key, env).transform(s => s.trim()).assert(minLen(1));
}

/**
 * Creates a number-typed environment variable configuration.
 *
 * @param {string} key - The environment variable key to read from `process.env`.
 * @param {number} [defaultValue] - Optional default value.
 *
 * @returns {Envy<number>} A new Envy instance.
 *
 * @throws {MissingError} If no value is available and no default value was provided.
 * @throws {ConversionError} If the conversion to a number fails.
 *
 * @example
 * ```typescript
 * import { envy, assert, strConv } from "@tsxo/envy";
 *
 * const port = envy.required("PORT")
 *   .convert(strConv.toNumber)
 *   .assert(assert.isPort())
 *   .build();
 * ```
 */
export function number(key: string, defaultValue?: number): Envy<number> {
    const env = process.env[key];
    if (env === undefined) return defaultExn(key, defaultValue);
    return new Envy(key, toNumber(env));
}

/**
 * Creates a boolean-typed environment variable configuration.
 *
 * @param {string} key - The environment variable key to read from `process.env`.
 * @param {boolean} [defaultValue] - Optional default value.
 *
 * @returns {Envy<boolean>} A new Envy instance.
 *
 * @throws {MissingError} If no value is available and no default value was provided.
 * @throws {ConversionError} If the conversion to a boolean fails.
 *
 * @example
 * ```typescript
 * import { envy } from "@tsxo/envy";
 *
 * const debug = envy.bool("DEBUG", false).build();
 * ```
 */
export function bool(key: string, defaultValue?: boolean): Envy<boolean> {
    const env = process.env[key];
    if (env === undefined) return defaultExn(key, defaultValue);
    return new Envy(key, toBool(env));
}

/**
 * Creates a string array environment variable configuration.
 *
 * @param {string} key - The environment variable key to read from `process.env`.
 * @param {string[]} [defaultValue] - Optional default value.
 *
 * @returns {Envy<string[]>} A new Envy instance.
 *
 * @throws {MissingError} If no value is available and no default value was provided.
 * @throws {ConversionError} If the conversion to an array fails.
 *
 * @example
 * ```typescript
 * import { envy } from "@tsxo/envy";
 *
 * const debug = envy.array("CORS", ["*"]).build();
 * ```
 */
export function array(key: string, defaultValue?: string[]): Envy<string[]> {
    const env = process.env[key];
    if (env === undefined) return defaultExn(key, defaultValue);
    return new Envy(key, toArray(env));
}

/**
 * Creates a prefixed environment variable builder.
 *
 * @param {string} prefix - The prefix to add to all environment variable keys.
 *
 * @returns An object with all standard Envy functions that automatically prefix
 * keys.
 *
 * @example
 * ```typescript
 * import { envy, assert, strConv } from "@tsxo/envy";
 *
 * const app = envy.withPrefix("APP_");
 *
 * const port = app.required("PORT")  // Reads from APP_PORT
 *   .convert(strConv.toNumber)
 *   .assert(assert.isPort())
 *   .build();
 *
 * const debug = app.bool("DEBUG", false).build(); // Reads from APP_DEBUG
 * ```
 */
export function withPrefix(prefix: string) {
    const normalizedPrefix = prefix.endsWith("_") ? prefix : `${prefix}_`;

    return {
        /**
         * Creates a required environment variable configuration with the provided
         * prefix.
         *
         * Will automatically trim the string value.
         *
         * @param {string} key - The environment variable key.
         *
         * @returns {Envy<string>} A new Envy instance.
         *
         * @throws {MissingError} If no value is available.
         * @throws {AssertError} If the value is an empty string.
         *
         * @example
         * ```typescript
         * import { envy, assert, strConv } from "@tsxo/envy";
         *
         * const app = envy.withPrefix("APP_");
         *
         * const port = app.required("PORT")  // Reads from APP_PORT
         *   .convert(strConv.toNumber)
         *   .assert(assert.isPort())
         *   .build();
         * ```
         */
        required(key: string): Envy<string> {
            return required(`${normalizedPrefix}${key}`);
        },

        /**
         * Creates an optional environment variable configuration with the provided
         * prefix.
         *
         * @param {string} key - The environment variable key.
         * @param {string} defaultValue - Required default value.
         *
         * @returns {Envy<string>} A new Envy instance.
         *
         * @throws {MissingError} If no value is available and no default value was provided.
         * @throws {AssertError} If the value is an empty string.
         *
         * @example
         * ```typescript
         * import { envy, assert } from "@tsxo/envy";
         *
         * const app = envy.withPrefix("APP_");
         *
         * const region = app.optional("AWS_REGION", "us-east-1") // Reads from APP_AWS_REGION
         *   .assert(assert.minLen(1))
         *   .assert(assert.prefix("us-"))
         *   .build();
         * ```
         */
        optional(key: string, defaultValue: string): Envy<string> {
            return optional(`${normalizedPrefix}${key}`, defaultValue);
        },

        /**
         * Creates a number-typed environment variable configuration with the
         * provided prefix.
         *
         * @param {string} key - The environment variable key.
         * @param {number} [defaultValue] - Optional default value.
         *
         * @returns {Envy<number>} A new Envy instance.
         *
         * @throws {MissingError} If no value is available and no default value was provided.
         * @throws {ConversionError} If the conversion to a number fails.
         *
         * @example
         * ```typescript
         * import { envy, assert, strConv } from "@tsxo/envy";
         *
         * const app = envy.withPrefix("APP_");
         *
         * const port = app.required("PORT")  // Reads from APP_PORT
         *   .convert(strConv.toNumber)
         *   .assert(assert.isPort())
         *   .build();
         * ```
         */
        number(key: string, defaultValue?: number): Envy<number> {
            return number(`${normalizedPrefix}${key}`, defaultValue);
        },

        /**
         * Creates a boolean-typed environment variable configuration with the
         * provided prefix.
         *
         * @param {string} key - The environment variable key.
         * @param {boolean} [defaultValue] - Optional default value.
         *
         * @returns {Envy<boolean>} A new Envy instance.
         *
         * @throws {MissingError} If no value is available and no default value was provided.
         * @throws {ConversionError} If the conversion to a boolean fails.
         *
         * @example
         * ```typescript
         * import { envy } from "@tsxo/envy";
         *
         * const app = envy.withPrefix("APP_");
         *
         * const debug = app.bool("DEBUG", false).build(); // Reads from APP_DEBUG
         * ```
         */
        bool(key: string, defaultValue?: boolean): Envy<boolean> {
            return bool(`${normalizedPrefix}${key}`, defaultValue);
        },

        /**
         * Creates a string array environment variable configuration with the
         * provided prefix.
         *
         * @param {string} key - The environment variable key to read from `process.env`.
         * @param {string[]} [defaultValue] - Optional default value.
         *
         * @returns {Envy<string[]>} A new Envy instance.
         *
         * @throws {MissingError} If no value is available and no default value was provided.
         * @throws {ConversionError} If the conversion to an array fails.
         *
         * @example
         * ```typescript
         * import { envy } from "@tsxo/envy";
         *
         * const app = envy.withPrefix("APP_");
         *
         * const debug = app.array("CORS", ["*"]).build(); // Reads from APP_CORS
         * ```
         */
        array(key: string, defaultValue?: string[]): Envy<string[]> {
            return array(`${normalizedPrefix}${key}`, defaultValue);
        },

        /**
         * Creates a nested prefix builder (for hierarchical prefixes).
         *
         * @example
         * ```typescript
         * import { envy } from "@tsxo/envy";
         *
         * const app = envy.withPrefix("APP_");
         * const db = app.withPrefix("DB_"); // Results in APP_DB_ prefix
         *
         * const host = db.required("HOST").build(); // Reads from APP_DB_HOST
         * ```
         */
        withPrefix(nestedPrefix: string) {
            return withPrefix(`${normalizedPrefix}${nestedPrefix}`);
        },
    };
}

/**
 * Creates a new Envy instance with a default value, or throws a `MissingError`
 * if no default value was provided.
 *
 * @param {string}  key
 * @param {T}       val
 *
 * @returns {Envy<T>} A new Envy instance.
 * @throws {MissingError}
 */
function defaultExn<T>(key: string, val?: T): Envy<T> {
    if (val === undefined) throw new MissingError(key);
    return new Envy(key, val);
}
