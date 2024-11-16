import { test, expect, suite } from "vitest";
import {
    AssertError,
    BaseError,
    ConversionError,
    MissingError,
    TransformError,
} from "../errors.js";
import type { ErrCtx } from "../types.js";

suite("Errors", function () {
    const key = "key";
    const value = "value";

    const ctx = {
        description: "test desc",
        extra: "extra",
    } as const satisfies ErrCtx;

    suite("Base Error", function () {
        const msg = "[ERROR] Base Error";

        test("Should correctly construct a Base Error", function () {
            const err = new BaseError(msg, ctx);
            expect(err.message).to.equal(msg);
            expect(err.context?.description).to.equal(ctx.description);
            expect(err.context?.key).to.equal(undefined);
            expect(err.context?.value).to.equal(undefined);
            expect(err.context?.extra).to.equal(ctx.extra);
        });
    });

    suite("Missing Error", function () {
        const msg = `[ERROR] Environment variable "${key}" is not defined and no default was provided.`;

        test("Should correctly construct a Missing Error", function () {
            const err = new MissingError(key);
            expect(err.message).to.equal(msg);
            expect(err.context?.key).to.equal(key);
        });
    });

    suite("Assert Error", function () {
        const msg = `[ERROR] Environment variable "${key}" with value "${value}" failed assertion.`;

        test("Should correctly construct an Assert Error", function () {
            const err = new AssertError(key, value, ctx);

            expect(err.message).to.equal(msg);
            expect(err.context?.description).to.equal(ctx.description);
            expect(err.context?.key).to.equal(key);
            expect(err.context?.value).to.equal(value);
            expect(err.context?.extra).to.equal(ctx.extra);
        });
    });

    suite("Transform Error", function () {
        const msg = `[ERROR] Failed to transform environment variable "${key}" with value ${value}.`;

        test("Should correctly construct a Transform Error", function () {
            const err = new TransformError(key, value);

            expect(err.message).to.equal(msg);
            expect(err.context?.description).to.equal(undefined);
            expect(err.context?.key).to.equal(key);
            expect(err.context?.value).to.equal(value);
        });
    });

    suite("Conversion Error", function () {
        const msg = `[ERROR] Failed to convert value: "${value}".`;

        test("Should correctly construct an Assert Error", function () {
            const err = new ConversionError(value, ctx);

            expect(err.message).to.equal(msg);
            expect(err.context?.description).to.equal(ctx.description);
            expect(err.context?.key).to.equal(key);
            expect(err.context?.value).to.equal(value);
            expect(err.context?.extra).to.equal(ctx.extra);
        });
    });
});
