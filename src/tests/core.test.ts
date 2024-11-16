import { test, expect, suite, beforeEach, afterEach } from "vitest";
import { bool, required, number, optional, array } from "../core.js";
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
        // test("envyRequired should require non-empty value", () => {
        //     process.env.REQUIRED = "value";
        //     const value = required("REQUIRED").build();
        //     expect(value).toBe("value");
        //
        //     process.env.REQUIRED = "";
        //     expect(() => envyRequired("REQUIRED").build()).toThrow(
        //         EnvyMissingError,
        //     );
        // });

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
            value = optional("OPTIONAL", "default").build();
            expect(value).toBe("default");

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
});
