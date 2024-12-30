/**
 * A context object for function metadata, allowing for flexible addition of
 * properties that can provide additional information for debugging or
 * error handling.
 *
 * @property {string} description - A description of the action.
 * @property {unknown} [key: string] - Additional properties for flexible context data.
 */
export type FnCtx = {
    description: string;
    [key: string]: unknown;
};

/**
 * Context object for providing error metadata.
 *
 * @property {string} [description] - A description of the action.
 * @property {string} [key] - The environment variable key.
 * @property {unknown} [value] - The environment variable value
 */
export type ErrCtx = {
    description?: string;
    key?: string;
    value?: unknown;
    [key: string]: unknown;
};

/**
 * A function type used for assertions, which validates a given value and
 * provides optional metadata for error handling and debugging.
 *
 * @template T - The type of the value being asserted.
 *
 * @property {(v: T) => boolean} - A function that accepts a value of type `T`
 * and returns a boolean indicating if the assertion passed.
 *
 * @property {string} [description] - An optional description of the assertion.
 *
 * @property {FnCtx} [context] - Optional context.
 */
export type AssertFn<T> = {
    (v: T): boolean;
    context?: FnCtx;
};

/**
 * Function type for narrowing a value from type T to a more specific type N.
 *
 * @template T The original type of the value.
 * @template N The narrowed type that extends T.
 *
 * @param   {T} v - The value to narrow.
 *
 * @returns {v is N} Type predicate indicating if the value is of the narrowed type N.
 *
 * @example
 * ```typescript
 * type LogLevel = 'debug' | 'info' | 'warn' | 'error';
 * const isLogLevel: NarrowFn<string, LogLevel> =
 *   (v): v is LogLevel => ['debug', 'info', 'warn', 'error'].includes(v);
 * ```
 */
export type NarrowFn<T, N extends T> = (v: T) => v is N;

/**
 * Function type for transforming a value of type T.
 *
 * @template T The type of the value to transform.
 *
 * @param   {T} v - The value to transform.
 *
 * @returns {T} The transformed value.
 */
export type TransformFn<T> = (v: T) => T;

/**
 * Function type for converting a value from one type to another.
 *
 * @template In The input type.
 * @template Out The output type.
 *
 * @param   {In} v - The value to convert.
 *
 * @returns {Out} The converted value.
 */
export type ConvertFn<In, Out> = (v: In) => Out;
