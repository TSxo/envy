import type { ErrCtx } from "./types.js";

/**
 * Base error class for all Envy related errors.
 * Provides common functionality and ensures proper prototype chain.
 */
export class BaseError extends Error {
    public readonly context?: ErrCtx;

    constructor(message: string, ctx?: ErrCtx) {
        super(message);
        this.name = this.constructor.name;
        this.context = ctx;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Thrown when an environment variable is missing and no default value was
 * provided.
 */
export class MissingError extends BaseError {
    constructor(key: string) {
        const err = `[ERROR] Environment variable "${key}" is not defined and no default was provided.`;
        super(err, { key });
    }
}

/**
 * Thrown when an assertion fails.
 */
export class AssertError<T> extends BaseError {
    constructor(key: string, value: T, ctx: ErrCtx = {}) {
        const err = `[ERROR] Environment variable "${key}" with value "${value}" failed assertion.`;
        ctx.key = key;
        ctx.value = value;
        super(err, ctx);
    }
}

/**
 * Thrown when a transformation fails.
 */
export class TransformError<T> extends BaseError {
    constructor(key: string, value: T) {
        const err = `[ERROR] Failed to transform environment variable "${key}" with value ${value}.`;
        super(err, { key, value });
    }
}

/**
 * Thrown when type conversion fails.
 */
export class ConversionError extends BaseError {
    constructor(value: string, ctx: ErrCtx = {}) {
        const err = `[ERROR] Failed to convert value: "${value}".`;
        ctx.value = value;
        super(err, ctx);
    }
}
