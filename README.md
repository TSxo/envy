# @tsxo/envy

A powerful, simple, and type-safe environment variable management library for
Javascript and TypeScript applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

## Features

-   **Type Safety** - Full TypeScript support with comprehensive type definitions
-   **Value Transformation** - Transform and normalize values with ease
-   **Validation** - Rich set of built-in assertions for common use cases
-   **Type Conversion** - Convert strings to numbers, booleans, arrays, and more
-   **Method Chaining** - Fluent API for building configurations
-   **Error Handling** - Detailed error messages for missing or invalid values
-   **Dotenv Compatible** - Fully compatible with [Dotenv](https://github.com/motdotla/dotenv)

## Installation

```bash
npm install @tsxo/envy
```

## Quick Start

All environment variable configurations in Envy follow a builder pattern, where
you chain methods to assert, convert, and transfrom. Finally, you call `.build()`
to get the final value. Each assertion, conversion, and transformation occur
greedily (at the point they are called).

If you wish to use Dotenv, please import and configure it before using Envy.

```typescript
import { envy, strConv, assert } from "@tsxo/envy";

// Required values.
const apiKey = envy.required("API_KEY").assert(assert.minLen(32)).build();

// Optional values with defaults.
// Note: Does not fallback to the optional value if validations fail.
const region = envy
    .optional("AWS_REGION", "us-east-1")
    .assert(assert.prefix("us-"))
    .build();

// Number conversion.
const port = envy.number("PORT", 3000).assert(assert.isPort()).build();

// Boolean conversion.
// Recognises the following values as `true`: "true", "yes", "1", "on".
// Recognises the following values as `false`: "false", "no", "0", "off".
const debug = envy.bool("DEBUG", false).build();

// Array parsing (comma-separated by default).
const whitelist = envy
    .array("IP_WHITELIST", ["127.0.0.1"])
    .assert(assert.minLen(1))
    .build();

// Manual conversion, transformation, and validation.
const manual = envy
    .optional("MANUAL", "42")
    .transform(s => s.trim())
    .assert(s => s.length() > 0, "Must have a length greater than zero")
    .convert(strConv.toNumber()) // You can use whichever method of conversion here.
    .build();
```

## Core Concepts

### Value Types

Envy supports several built-in types:

-   **Strings** - Default type for all environment variables
-   **Numbers** - Using `strConv.toNumber` or `envy.number`
-   **Booleans** - Using `strConv.toBool` or `envy.bool`
-   **Arrays** - Using `strConv.toArray` or `envy.array`

### Type System

The library provides a robust type system for handling assertions, transformations,
and error contexts.

#### Function Types

```typescript
/**
 * Assertion function type that validates a value and provides metadata.
 */
type AssertFn<T> = {
    (v: T): boolean;
    context?: FnCtx;
};

/**
 * Transform function for modifying values while maintaining their type.
 */
type TransformFn<T> = (v: T) => T;

/**
 * Conversion function for changing value types.
 */
type ConvertFn<In, Out> = (v: In) => Out;
```

#### Context Types

```typescript
/**
 * Function metadata context for debugging and error handling.
 */
type FnCtx = {
    description: string;
    [key: string]: unknown;
};

/**
 * Error context with detailed information about failures.
 */
type ErrCtx = {
    description?: string;
    key?: string;
    value?: unknown;
    [key: string]: unknown;
};
```

### Assertion System

Envy provides a comprehensive assertion system with built-in validators, the
ability to create custom ones, or simply inline your logic.

#### Length Assertions

```typescript
// Exact length.
const key = envy.required("API_KEY").assert(assert.len(32)).build();

// Minimum length.
const password = envy.required("DB_PASSWORD").assert(assert.minLen(8)).build();

// Maximum length.
const username = envy.required("DB_USER").assert(assert.maxLen(20)).build();
```

#### String Pattern Assertions

```typescript
// Prefix validation.
const bucket = envy.required("S3_BUCKET").assert(assert.prefix("app-")).build();

// Suffix validation.
const logFile = envy.required("LOG_FILE").assert(assert.suffix(".log")).build();

// Substring check.
const dbUrl = envy
    .required("DATABASE_URL")
    .assert(assert.substring("postgres://"))
    .build();

// Regex matching.
const email = envy
    .required("ADMIN_EMAIL")
    .assert(assert.matches(/^admin-/)) // Ensure email starts with "admin-"
    .build();
```

#### URL and Network Assertions

```typescript
// URL validation with protocol restrictions.
const apiEndpoint = envy
    .required("API_ENDPOINT")
    .assert(assert.isURL(["https:"]))
    .build();

// Port number validation.
const serverPort = envy.number("SERVER_PORT").assert(assert.isPort()).build();
```

#### Enumerated Values

```typescript
// Restricted value set.
const logLevel = envy
    .required("LOG_LEVEL")
    .assert(assert.options(["debug", "info", "warn", "error"]))
    .build();
```

#### Creating Custom Assertions

Create reusable, type-safe assertions with rich error contexts:

```typescript
// Custom port range validator.
const isServicePort = assert.create(
    (value: number) => value >= 1024 && value <= 49151,
    {
        description: "Must be a valid service port number",
        min: 1024,
        max: 49151,
    },
);

// Custom semantic version validator.
const isSemVer = assert.create(
    (value: string) => /^\d+\.\d+\.\d+$/.test(value),
    {
        description: "Must be a semantic version (x.y.z)",
        format: "semantic version",
        example: "1.0.0",
    },
);

// Usage
const servicePort = envy.number("SERVICE_PORT").assert(isServicePort()).build();

const version = envy.required("APP_VERSION").assert(isSemVer()).build();
```

#### Inline Assertions

While creating custom assertions is great for reusability, you can also write
assertions inline using the `assert` method. This is particularly useful for
one-off validations or simple checks:

```typescript
// Simple inline assertion with custom error message
const username = envy
    .required("USERNAME")
    .assert(
        val => val.length >= 3 && val.length <= 20,
        "Username must be between 3 and 20 characters",
    )
    .build();

// Combining inline and custom assertions
const databaseUrl = envy
    .required("DATABASE_URL")
    .assert(assert.isURL(["postgres:"])) // Built-in assertion
    .assert(
        // Inline assertion
        url => url.includes("@") && url.includes("/"),
        "Database URL must include credentials and database name",
    )
    .build();
```

## Error Types

The library uses three specific error types:

-   **MissingError**

    -   Thrown when a required environment variable is not found
    -   Contains the missing variable key and a descriptive message

-   **AssertError**

    -   Thrown when a validation check fails
    -   Includes the failed value, assertion description, and any custom context

-   **ConversionError**
    -   Thrown when type conversion fails (e.g., converting "abc" to a number)
    -   Contains the original value, target type, and reason for failure

## Best Practices

1. **Validation First**: Add assertions immediately after defining variables
2. **Chain Assertions**: Use multiple assertions to create robust validation
3. **Meaningful Messages**: Provide clear error messages for assertions
4. **Type Safety**: Use appropriate assertions with type conversions
5. **Documentation**: Document expected formats and constraints

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - fork, modify and use however you want.
