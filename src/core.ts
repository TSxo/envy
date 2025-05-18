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
 * Core state of an Envy instance.
 */
type EnvyState<T> = {
    _key: string;
    _value: T;
};

/**
 * Method definitions for Envy objects.
 */
type EnvyMethods<T> = {
    /**
     * Applies a transformation function to the value.
     *
     * @param {TransformFn<T>} fn - A transformation function.
     *
     * @returns {Envy<T>} This instance for method chaining.
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
    transform(fn: TransformFn<T>): Envy<T>;

    /**
     * Validates the current value using a predicate function.
     *
     * The assertion function should return true if the value is valid and false
     * otherwise. If validation fails, an error is thrown.
     *
     * @param {AssertFn<T>} fn - Predicate function.
     * @param {string} [msg] - An optional user-defined message.
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
    assert(fn: AssertFn<T>, msg?: string): Envy<T>;

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
    convert<O>(fn: ConvertFn<T, O>): Envy<O>;

    /**
     * Narrows the type of the current value using a type guard function.
     *
     * @template N The narrowed type.
     *
     * @param {NarrowFn} fn - Type guard function.
     * @param {string} [msg] - Optional error message if narrowing fails.
     *
     * @returns {Envy<N>} This instance, cast to N.
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
     *   .build(); // region is now typed as Region rather than string.
     * ```
     */
    narrow<N extends T>(fn: NarrowFn<T, N>, msg?: string): Envy<N>;

    build(): T;
};

/**
 * # Description
 *
 * Type for handling environment variables with validation, transformation,
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
type Envy<T> = EnvyState<T> & EnvyMethods<T>;

/**
 * Shared Envy Prototype.
 */
const EnvyPrototype: EnvyMethods<unknown> = {
    transform(this: Envy<unknown>, fn) {
        this._value = fn(this._value);
        return this;
    },

    assert(this: Envy<unknown>, fn, msg) {
        const valid = fn(this._value);

        if (!valid) {
            const ctx: ErrCtx = fn.context || {};
            if (msg) ctx.userMessage = msg;

            throw new AssertError(this._key, this._value, ctx);
        }

        return this;
    },

    convert<O>(this: Envy<unknown>, fn: ConvertFn<unknown, O>) {
        const converted = fn(this._value);
        return createEnvy<O>(this._key, converted);
    },

    narrow<N>(this: Envy<unknown>, fn: NarrowFn<unknown, N>, msg?: string) {
        if (!fn(this._value)) {
            const ctx: ErrCtx = { description: "Failed type-narrowing" };
            if (msg) ctx.userMessage = msg;

            throw new AssertError(this._key, this._value, ctx);
        }

        return this as unknown as Envy<N>;
    },

    build(this: Envy<unknown>) {
        return this._value;
    },
};

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

    const envy = createEnvy(key, env);
    return envy.transform(s => s.trim()).assert(minLen(1));
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
    const env = process.env[key];
    const value = env || defaultValue;

    const envy = createEnvy(key, value);
    return envy.transform(s => s.trim()).assert(minLen(1));
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

    if (env === undefined) {
        if (defaultValue === undefined) throw new MissingError(key);
        return createEnvy(key, defaultValue);
    }

    return createEnvy(key, toNumber(env));
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

    if (env === undefined) {
        if (defaultValue === undefined) throw new MissingError(key);
        return createEnvy(key, defaultValue);
    }

    return createEnvy(key, toBool(env));
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

    if (env === undefined) {
        if (defaultValue === undefined) throw new MissingError(key);
        return createEnvy(key, defaultValue);
    }

    return createEnvy(key, toArray(env));
}

/**
 * Factory function to create Envy instances with proper prototype.
 */
function createEnvy<T>(key: string, value: T): Envy<T> {
    const envyState: EnvyState<T> = { _key: key, _value: value };

    Object.setPrototypeOf(envyState, EnvyPrototype);

    return envyState as Envy<T>;
}
