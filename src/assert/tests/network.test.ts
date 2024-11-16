import { test, expect, suite } from "vitest";
import { isPort, isURL } from "../network.js";

suite("Assert :: Network", function () {
    suite("Assert :: Network :: URL", function () {
        test("Should return the correct context", function () {
            const proto = ["https:", "http:"];
            const { context } = isURL(proto);
            expect(context?.description.startsWith("Must be a valid URL")).to.be
                .true;
            expect(context?.acceptedProtocols).toBe(proto);
        });

        test("Should correctly handle an empty protocol list", function () {
            const proto = [];
            const asserter = isURL(proto);
            expect(asserter("https://example.com")).to.be.true;
        });

        suite(
            "Should correctly assert with no defined protocol that:",
            function () {
                const table = [
                    { val: "https://www.testurl.com", expected: true },
                    { val: "postgresql://localhost", expected: true },
                    { val: "postgresql://localhost:5432", expected: true },
                    { val: "postgresql://localhost/mydb ", expected: true },
                    { val: "https://url.com/path?param1=one", expected: true },
                    { val: "url.com/path?param1=one", expected: false },
                    { val: "127.0.0.1", expected: false },
                    { val: "127.0.0.1:3000", expected: false },
                    { val: "www.testurl.com", expected: false },
                    { val: "testurl.com", expected: false },
                    { val: "this is a sentence", expected: false },
                    { val: "ftp://example.com", expected: true },
                    { val: "ws://localhost:8080", expected: true },
                    { val: "wss://secure.example.com", expected: true },
                    { val: "data:text/plain;base64,SGVsbG8=", expected: true },
                    { val: "file:///path/to/file.txt", expected: true },
                    { val: "mailto:user@example.com", expected: true },
                    { val: "", expected: false },
                    { val: "https://", expected: false },
                    { val: "://example.com", expected: false },
                    { val: " https://example.com", expected: true },
                    { val: "https://example.com ", expected: true },
                    {
                        val: "https://example.com/path with spaces",
                        expected: true,
                    },
                    { val: "https://user:pass@example.com", expected: true },
                    { val: "https://例子.com", expected: true },
                    { val: "https://subdomain.例子.com", expected: true },
                ];

                for (let i = 0; i < table.length; i++) {
                    const t = table[i];
                    const asserter = isURL();

                    test(`${t.val} is ${t.expected}`, function () {
                        expect(asserter(t.val)).toBe(t.expected);
                    });
                }
            },
        );
    });

    suite(
        "Should correctly assert with a defined protocol of https that:",
        function () {
            const table = [
                { val: "https://www.testurl.com", expected: true },
                { val: "postgresql://localhost", expected: false },
                { val: "postgresql://localhost:5432", expected: false },
                { val: "postgresql://localhost/mydb ", expected: false },
                { val: "https://url.com/path?param1=one", expected: true },
                { val: "url.com/path?param1=one", expected: false },
                { val: "127.0.0.1", expected: false },
                { val: "127.0.0.1:3000", expected: false },
                { val: "www.testurl.com", expected: false },
                { val: "testurl.com", expected: false },
                { val: "this is a sentence", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];
                const asserter = isURL(["https:"]);

                test(`${t.val} is ${t.expected}`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        },
    );

    suite(
        "Should correctly assert with defined protocols of https and http that:",
        function () {
            const table = [
                { val: "https://www.testurl.com", expected: true },
                { val: "http://www.testurl.com", expected: true },
                { val: "http://www.testurl.com/path?p=1", expected: true },
                { val: "postgresql://localhost", expected: false },
                { val: "postgresql://localhost:5432", expected: false },
                { val: "postgresql://localhost/mydb ", expected: false },
                { val: "https://url.com/path?param1=one", expected: true },
                { val: "url.com/path?param1=one", expected: false },
                { val: "127.0.0.1", expected: false },
                { val: "127.0.0.1:3000", expected: false },
                { val: "www.testurl.com", expected: false },
                { val: "testurl.com", expected: false },
                { val: "this is a sentence", expected: false },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];
                const asserter = isURL(["https:", "http:"]);

                test(`${t.val} is ${t.expected}`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        },
    );

    suite("Assert :: Network :: Port", function () {
        test("Should return the correct context", function () {
            const { context } = isPort();
            expect(context?.description).toBe(
                "Port must be between 1 and 65535",
            );
            expect(context?.min).toBe(1);
            expect(context?.max).toBe(65535);
        });

        suite("Should correctly assert that:", function () {
            const table = [
                { val: -1, expected: false },
                { val: 0, expected: false },
                { val: 65535, expected: true },
                { val: 65536, expected: false },
                { val: 1, expected: true },
            ];

            for (let i = 0; i < table.length; i++) {
                const t = table[i];
                const asserter = isPort();

                test(`A port of ${t.val} is ${t.expected}`, function () {
                    expect(asserter(t.val)).toBe(t.expected);
                });
            }
        });
    });
});
