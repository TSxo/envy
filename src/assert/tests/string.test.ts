import { test, expect, suite } from "vitest";
import { prefix, suffix, substring, matches, options } from "../string.js";

suite("Assert :: String", function () {
    suite("Assert :: String :: Prefix", function () {
        test("Should return the correct context", function () {
            const { context } = prefix("TEST_");
            expect(context?.description.startsWith("Must have a prefix of:")).to
                .be.true;
            expect(context?.prefix).toBe("TEST_");
        });

        suite("Should correctly assert: ", function () {
            const table = [
                { val: "DEV_api", test: "DEV_", expected: true },
                { val: "PROD_db", test: "PROD_", expected: true },
                { val: "api_DEV", test: "DEV_", expected: false },
                { val: "devapi", test: "DEV_", expected: false },
                { val: "", test: "TEST_", expected: false },
                { val: "TEST", test: "TEST_", expected: false },
                { val: "TEST_", test: "TEST_", expected: true },
                { val: " TEST_val", test: "TEST_", expected: false },
                { val: "TEST_value", test: "", expected: true }, // empty prefix
                { val: "TEST_value", test: " ", expected: false }, // whitespace prefix
                { val: "🎉_value", test: "🎉_", expected: true }, // unicode prefix
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const asserter = prefix(t.test);
                const desc = t.expected ? "has" : "does not have";
                test(`String "${t.val}" ${desc} prefix "${t.test}"`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });

    suite("Assert :: String :: Suffix", function () {
        test("Should return the correct context", function () {
            const { context } = suffix("_TEST");
            expect(context?.description.startsWith("Must have a suffix of:")).to
                .be.true;
            expect(context?.suffix).toBe("_TEST");
        });

        suite("Should correctly assert: ", function () {
            const table = [
                { val: "api_DEV", test: "_DEV", expected: true },
                { val: "db_PROD", test: "_PROD", expected: true },
                { val: "DEV_api", test: "_api", expected: true },
                { val: "apidev", test: "_DEV", expected: false },
                { val: "", test: "_TEST", expected: false },
                { val: "TEST", test: "_TEST", expected: false },
                { val: "_TEST", test: "_TEST", expected: true },
                { val: "value_TEST ", test: "_TEST", expected: false },
                { val: "value_TEST", test: "", expected: true }, // empty suffix
                { val: "value_TEST", test: " ", expected: false }, // whitespace suffix
                { val: "value_🎉", test: "_🎉", expected: true }, // unicode suffix
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const asserter = suffix(t.test);
                const desc = t.expected ? "has" : "does not have";
                test(`String "${t.val}" ${desc} suffix "${t.test}"`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });

    suite("Assert :: String :: Substring", function () {
        test("Should return the correct context", function () {
            const { context } = substring("test");
            expect(context?.description.startsWith("Must contain:")).to.be.true;
            expect(context?.substring).toBe("test");
        });

        suite("Should correctly assert: ", function () {
            const table = [
                { val: "testing123", test: "test", expected: true },
                { val: "hello test world", test: "test", expected: true },
                { val: "TEST", test: "test", expected: false },
                { val: "", test: "test", expected: false },
                { val: "tes ting", test: "test", expected: false },
                { val: "tst", test: "test", expected: false },
                { val: "test", test: "test", expected: true },
                { val: "testtest", test: "test", expected: true }, // multiple occurrences
                { val: "test", test: "", expected: true }, // empty substring
                { val: "test", test: " ", expected: false }, // whitespace substring
                { val: "hello 🎉 world", test: "🎉", expected: true }, // unicode substring
                { val: "hello.world", test: ".", expected: true }, // special characters
                { val: "test\ntest", test: "test", expected: true }, // multiline
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const asserter = substring(t.test);
                const desc = t.expected ? "contains" : "does not contain";
                test(`String "${t.val}" ${desc} substring "${t.test}"`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });

    suite("Assert :: String :: Matches", function () {
        test("Should return the correct context", function () {
            const rx = /^test/;
            const { context } = matches(rx);
            expect(context?.description.startsWith("Must match:")).to.be.true;
            expect(context?.regex).toBe(rx.source);
        });

        suite("Should correctly assert: ", function () {
            const table = [
                { val: "https://example.com", test: /^https:/, expected: true },
                { val: "test123", test: /^test\d+$/, expected: true },
                { val: "http://example.com", test: /^https:/, expected: false },
                { val: "test", test: /^test\d+$/, expected: false },
                { val: "", test: /^$/, expected: true }, // empty string
                { val: "TEST", test: /test/i, expected: true }, // case insensitive
                { val: "test\ntest", test: /test$/m, expected: true }, // multiline
                { val: "test", test: /test/, expected: true }, // RegExp object
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const asserter = matches(t.test);
                const desc = t.expected ? "matches" : "does not match";
                test(`String "${t.val}" ${desc} regex "${t.test.source}"`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });

    suite("Assert :: String :: Options", function () {
        test("Should return the correct context", function () {
            const validOptions = ["dev", "staging", "prod"];
            const { context } = options(validOptions);
            expect(context?.description).to.equal(
                "Must be one of: dev, staging, prod",
            );
            expect(context?.options).to.deep.equal(validOptions);
        });

        suite("Should match exact values", function () {
            const opts = ["dev", "prod", "staging"];
            const asserter = options(opts);
            const table = [
                { val: "dev", expected: true },
                { val: "prod", expected: true },
                { val: "staging", expected: true },
                { val: "test", expected: false },
                { val: "", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should be case sensitive", function () {
            const opts = ["DEV", "PROD"];
            const asserter = options(opts);
            const table = [
                { val: "DEV", expected: true },
                { val: "PROD", expected: true },
                { val: "dev", expected: false },
                { val: "prod", expected: false },
                { val: "Dev", expected: false },
                { val: "pRoD", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should handle empty options array", function () {
            const opts: string[] = [];
            const asserter = options(opts);
            const table = [
                { val: "", expected: false },
                { val: "any", expected: false },
                { val: "test", expected: false },
                { val: " ", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should handle options with special characters", function () {
            const opts = ["user.name", "user.email", "user.id"];
            const asserter = options(opts);
            const table = [
                { val: "user.name", expected: true },
                { val: "user.email", expected: true },
                { val: "user.id", expected: true },
                { val: "username", expected: false },
                { val: "user", expected: false },
                { val: ".name", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should handle options with spaces", function () {
            const opts = ["new york", "los angeles", "san francisco"];
            const asserter = options(opts);
            const table = [
                { val: "new york", expected: true },
                { val: "los angeles", expected: true },
                { val: "san francisco", expected: true },
                { val: "newyork", expected: false },
                { val: "new-york", expected: false },
                { val: " new york", expected: false },
                { val: "new york ", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should handle single option", function () {
            const opts = ["only-option"];
            const asserter = options(opts);
            const table = [
                { val: "only-option", expected: true },
                { val: "other-option", expected: false },
                { val: "", expected: false },
                { val: "only", expected: false },
                { val: "-option", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should handle duplicate values in options", function () {
            const opts = ["test", "test", "prod"];
            const asserter = options(opts);
            const table = [
                { val: "test", expected: true },
                { val: "prod", expected: true },
                { val: "dev", expected: false },
                { val: "", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });

        suite("Should handle whitespace variations", function () {
            const opts = ["test", " test", "test "];
            const asserter = options(opts);
            const table = [
                { val: "test", expected: true },
                { val: " test", expected: true },
                { val: "test ", expected: true },
                { val: "  test", expected: false },
                { val: "test  ", expected: false },
                { val: " test ", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];

                const desc = t.expected ? "Should accept" : "Should reject";
                test(`${desc} "${t.val}"`, function () {
                    expect(asserter(t.val)).to.equal(t.expected);
                });
            }
        });
    });
});
