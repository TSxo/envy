import { test, expect, suite, beforeEach, afterEach } from "vitest";
import {
    bool,
    required,
    number,
    optional,
    array,
    withPrefix,
} from "../core.js";
import { AssertError, ConversionError, MissingError } from "../errors.js";

// Mock process.env
const originalEnv = process.env;

suite("Core", function () {
    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    suite("Envy", () => {
        test("Should convert", () => {
            process.env.PORT = "3000";
            const port = required("PORT").convert(Number).build();
            expect(port).toBe(3000);
        });

        test("Should validate using assert function", () => {
            process.env.NUM = "5";
            expect(() =>
                required("NUM")
                    .convert(Number)
                    .assert(n => n == 1, "Must be one")
                    .build(),
            ).toThrow(AssertError);
        });

        test("Should type narrow", () => {
            const guard = (s: string): s is "5" => s === "5";
            process.env.NUM = "5";
            const out = required("NUM").narrow(guard, "Is not five").build();

            expect(out).toBe("5");
        });

        test("Should convert and validate", () => {
            process.env.PORT = "3000";
            const port = required("PORT")
                .convert(Number)
                .assert(p => p > 0 && p < 65536, "Invalid port")
                .build();
            expect(port).toBe(3000);
        });

        test("Should transform converted value", () => {
            process.env.NUMBER = "5";
            const doubled = required("NUMBER")
                .convert(Number)
                .transform(n => n * 2)
                .build();
            expect(doubled).toBe(10);
        });

        test("Should convert multiple times", () => {
            process.env.NUMBER = "42";
            const result = required("NUMBER")
                .convert(Number)
                .transform(n => n * 2)
                .convert(String)
                .transform(s => `Value: ${s}`)
                .assert(s => s.length > 0)
                .build();
            expect(result).toBe("Value: 84");
        });
    });

    suite("Convenience Functions", () => {
        test("Required should handle strings", () => {
            process.env.REQUIRED = "required";
            const value = required("REQUIRED").build();
            expect(value).toBe("required");
        });

        test("Required should throw if invalid values are retrieved", () => {
            process.env.REQUIRED = undefined;
            expect(() => required("REQUIRED").build()).to.throw(MissingError);

            process.env.REQUIRED = "";
            expect(() => required("REQUIRED").build()).to.throw(AssertError);
        });

        test("Optional should handle missing values", () => {
            let value = optional("OPTIONAL", "default").build();
            expect(value).toBe("default");

            process.env.OPTIONAL = "";
            expect(() => optional("OPTIONAL", "").build()).to.throw(
                AssertError,
            );

            process.env.OPTIONAL = undefined;
            value = optional("OPTIONAL", "default").build();
            expect(value).toBe("default");

            process.env.OPTIONAL = "custom";
            value = optional("OPTIONAL", "default").build();
            expect(value).toBe("custom");

            process.env.OPTIONAL = undefined;
            expect(() => optional("OPTIONAL", "").build()).to.throw(
                AssertError,
            );
        });

        test("Number should convert and validate numbers", () => {
            const defaultPort = number("PORT", 3000).build();
            expect(defaultPort).toBe(3000);

            process.env.PORT = "8080";
            const customPort = number("PORT", 3000).build();
            expect(customPort).toBe(8080);

            process.env.PORT = "invalid";

            expect(() => number("PORT", 3000).build()).toThrow(ConversionError);
        });

        test("Bool should handle boolean values", () => {
            const defaultValue = bool("DEBUG", false).build();
            expect(defaultValue).toBe(false);

            process.env.DEBUG = "true";
            const enabled = bool("DEBUG", false).build();
            expect(enabled).toBe(true);

            process.env.DEBUG = "1";
            const numericEnabled = bool("DEBUG", false).build();
            expect(numericEnabled).toBe(true);

            process.env.DEBUG = undefined;
            expect(() => bool("DEBUG", undefined).build()).to.throw(
                MissingError,
            );
        });

        test("Array should handle array values", () => {
            const defaultValue = array("CORS", ["*"]).build();
            expect(defaultValue).toStrictEqual(["*"]);

            process.env.CORS = "     one,     two, three";
            let value = array("CORS").build();
            expect(value).toStrictEqual(["one", "two", "three"]);

            process.env.CORS = undefined;
            expect(() => array("CORS", undefined).build()).to.throw(
                MissingError,
            );
        });
    });

    suite("Prefix Logic", function () {
        test("Should add prefix to environment variable keys", () => {
            process.env.APP_PORT = "3000";
            const app = withPrefix("APP");
            const port = app.required("PORT").convert(Number).build();
            expect(port).toBe(3000);
        });

        test("Should handle prefix with trailing underscore", () => {
            process.env.APP_HOST = "localhost";
            const app = withPrefix("APP_");
            const host = app.required("HOST").build();
            expect(host).toBe("localhost");
        });

        test("Should handle prefix without trailing underscore", () => {
            process.env.APP_DATABASE = "mydb";
            const app = withPrefix("APP");
            const database = app.required("DATABASE").build();
            expect(database).toBe("mydb");
        });

        test("Should work with required function", () => {
            process.env.API_KEY = "secret123";
            const api = withPrefix("API");
            const key = api.required("KEY").build();
            expect(key).toBe("secret123");
        });

        test("Should work with optional function", () => {
            process.env.APP_REGION = "us-west-2";
            const app = withPrefix("APP");
            const region = app.optional("REGION", "us-east-1").build();
            expect(region).toBe("us-west-2");

            // Test with missing value using default
            const region2 = app.optional("MISSING_REGION", "us-east-1").build();
            expect(region2).toBe("us-east-1");
        });

        test("Should work with number function", () => {
            process.env.APP_PORT = "8080";
            const app = withPrefix("APP");
            const port = app.number("PORT", 3000).build();
            expect(port).toBe(8080);

            // Test with missing value using default
            const port2 = app.number("MISSING_PORT", 3000).build();
            expect(port2).toBe(3000);
        });

        test("Should work with bool function", () => {
            process.env.APP_DEBUG = "true";
            const app = withPrefix("APP");
            const debug = app.bool("DEBUG", false).build();
            expect(debug).toBe(true);

            // Test with missing value using default
            const debug2 = app.bool("MISSING_DEBUG", false).build();
            expect(debug2).toBe(false);
        });

        test("Should work with array function", () => {
            process.env.APP_CORS = "origin1,origin2,origin3";
            const app = withPrefix("APP");
            const cors = app.array("CORS", ["*"]).build();
            expect(cors).toStrictEqual(["origin1", "origin2", "origin3"]);

            // Test with missing value using default
            const cors2 = app.array("MISSING_CORS", ["*"]).build();
            expect(cors2).toStrictEqual(["*"]);
        });

        test("Should support nested prefixes", () => {
            process.env.APP_DB_HOST = "localhost";
            process.env.APP_DB_PORT = "5432";

            const app = withPrefix("APP");
            const db = app.withPrefix("DB");

            const host = db.required("HOST").build();
            const port = db.number("PORT", 3306).build();

            expect(host).toBe("localhost");
            expect(port).toBe(5432);
        });

        test("Should handle multiple levels of nested prefixes", () => {
            process.env.APP_DB_POOL_SIZE = "10";
            process.env.APP_DB_POOL_TIMEOUT = "30000";

            const app = withPrefix("APP");
            const db = app.withPrefix("DB");
            const pool = db.withPrefix("POOL");

            const size = pool.number("SIZE", 5).build();
            const timeout = pool.number("TIMEOUT", 5000).build();

            expect(size).toBe(10);
            expect(timeout).toBe(30000);
        });

        test("Should work with transformations and assertions", () => {
            process.env.APP_URL = "  https://example.com  ";
            const app = withPrefix("APP");

            const url = app
                .required("URL")
                .transform(s => s.trim())
                .assert(s => s.startsWith("https://"), "Must be HTTPS")
                .build();

            expect(url).toBe("https://example.com");
        });

        test("Should work with type narrowing", () => {
            process.env.SERVICE_ENV = "production";
            const service = withPrefix("SERVICE");

            const isValidEnv = (
                s: string,
            ): s is "development" | "staging" | "production" =>
                ["development", "staging", "production"].includes(s);

            const env = service
                .required("ENV")
                .narrow(isValidEnv, "Invalid environment")
                .build();

            expect(env).toBe("production");
        });

        test("Should throw MissingError for required variables", () => {
            const app = withPrefix("APP");
            expect(() => app.required("NONEXISTENT").build()).toThrow(
                MissingError,
            );
        });

        test("Should throw ConversionError for invalid number", () => {
            process.env.APP_COUNT = "not_a_number";
            const app = withPrefix("APP");

            expect(() => app.number("COUNT", 0).build()).toThrow(
                ConversionError,
            );
        });

        test("Should handle empty string values correctly", () => {
            process.env.APP_NAME = "";
            const app = withPrefix("APP");

            expect(() => app.required("NAME").build()).toThrow(AssertError);
        });

        test("Should work with complex chaining", () => {
            process.env.API_RATE_LIMIT = "100";
            const api = withPrefix("API");

            const rateLimit = api
                .required("RATE_LIMIT")
                .convert(Number)
                .transform(n => n * 60) // Convert to per minute
                .assert(n => n > 0 && n <= 10000, "Rate limit out of range")
                .build();

            expect(rateLimit).toBe(6000);
        });

        test("Should work with whitespace-heavy prefixes", () => {
            process.env.MY_APP_CONFIG = "value";
            const app = withPrefix("MY_APP");
            const config = app.required("CONFIG").build();
            expect(config).toBe("value");
        });

        test("Should handle underscore normalization consistently", () => {
            process.env.TEST_VALUE = "test1";
            process.env.TEST_VALUE2 = "test2";

            const builder1 = withPrefix("TEST_");
            const builder2 = withPrefix("TEST");

            const value1 = builder1.required("VALUE").build();
            const value2 = builder2.required("VALUE2").build();

            expect(value1).toBe("test1");
            expect(value2).toBe("test2");
        });
    });
});
