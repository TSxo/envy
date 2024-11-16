import { test, expect, suite } from "vitest";
import { len, minLen, maxLen } from "../array-like.js";

suite("Assert :: Array Like", function () {
    suite("Assert :: Array like :: Len", function () {
        test("Should return the correct context", function () {
            const { context } = len(10);
            const expected = "Must have a length of:";

            expect(context?.description.startsWith(expected)).to.be.true;
            expect(context?.allowedLength).toBe(10);
        });

        suite("Should correctly assert: ", function () {
            const table = [
                { val: "ab", test: 2, expected: true },
                { val: "abc", test: 3, expected: true },
                { val: " abc", test: 4, expected: true },
                { val: " abc ", test: 5, expected: true },
                { val: "a", test: 2, expected: false },
                { val: " a", test: 1, expected: false },
                { val: " a ", test: 1, expected: false },
                { val: ["1", "2"], test: 1, expected: false },
                { val: ["1"], test: 2, expected: false },
                { val: ["1"], test: 1, expected: true },
                { val: "", test: 0, expected: true },
                { val: [], test: 0, expected: true },
                { val: { length: 2 }, test: 2, expected: true }, // array-like object
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];
                if (t == undefined) break;

                const asserter = len(t.test);
                const desc = t.expected ? "is of" : "is not of";

                test(`A value of "${t.val}" ${desc} len ${t.test}`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });

    suite("Assert :: Array Like :: Min Len", function () {
        test("Should return the correct context", function () {
            const { context } = minLen(10);
            const expected = "Must have a minimum length of:";

            expect(context?.description.startsWith(expected)).to.be.true;
            expect(context?.minimumLength).toBe(10);
        });

        suite("Should correctly assert:", function () {
            const table = [
                { val: "abcd", test: 2, expected: true },
                { val: "abc", test: 3, expected: true },
                { val: " abcdefg", test: 4, expected: true },
                { val: "a", test: 2, expected: false },
                { val: " a", test: 1, expected: true },
                { val: " a ", test: 1, expected: true },
                { val: " a ", test: 5, expected: false },
                { val: "", test: 0, expected: true },
                { val: "", test: 1, expected: false },
                { val: [], test: 0, expected: true },
                { val: { length: 5 }, test: 3, expected: true }, // array-like object
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];
                if (t == undefined) break;

                const asserter = minLen(t.test);
                const desc = t.expected
                    ? "has a minimum length of"
                    : "does not have a minimim length of";

                test(`A string of "${t.val}" ${desc} ${t.test}`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });

    suite("Assert :: String :: Max Len", function () {
        test("Should return the correct context", function () {
            const { context } = maxLen(10);
            const expected = "Must have a maximum length of:";
            expect(context?.description.startsWith(expected)).to.be.true;
            expect(context?.maximumLength).toBe(10);
        });

        suite("Should correctly assert:", function () {
            const table = [
                { val: "", test: 5, expected: true },
                { val: "abc", test: 5, expected: true },
                { val: "abcde", test: 5, expected: true },
                { val: "abcdef", test: 5, expected: false },
                { val: "   ", test: 2, expected: false },
                { val: "hello world", test: 8, expected: false },
                { val: [], test: 5, expected: true },
                { val: { length: 3 }, test: 5, expected: true }, // array-like object
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];
                if (t == undefined) break;

                const asserter = maxLen(t.test);
                const desc = t.expected ? "is within" : "exceeds";
                test(`String "${t.val}" ${desc} max length ${t.test}`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });
});
