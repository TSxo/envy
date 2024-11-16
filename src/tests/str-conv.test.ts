import { test, expect, suite } from "vitest";
import { toBool, toArray, toNumber } from "../str-conv.js";
import { ConversionError } from "../errors.js";

suite("String Convert", function () {
    suite("To Boolean", function () {
        const truthy = ["true", "yes", "1", "on", "  yes ", "  TRUE", "tRuE"];
        const falsy = ["false", "no", "0", "off", "  no  ", "FALSE", "FalSe"];
        const invalidValue = "invalid";
        const empty = "";

        test("Should convert truthy values to true", function () {
            truthy.forEach(val => expect(toBool(val)).to.be.true);
        });

        test("Should convert falsy values to false", function () {
            falsy.forEach(val => expect(toBool(val)).to.be.false);
        });

        test("Should throw ConversionError for invalid value", function () {
            expect(() => toBool(invalidValue)).to.throw(ConversionError);
        });

        test("Should throw ConversionError for empty string", function () {
            expect(() => toBool(empty)).to.throw(ConversionError);
        });
    });

    suite("To Array", function () {
        const table = [
            { input: "a, b, c", sep: ",", expected: ["a", "b", "c"] },
            { input: "1|2|3", sep: "|", expected: ["1", "2", "3"] },
            { input: "   a ; b; c", sep: ";", expected: ["a", "b", "c"] },
            { input: "   a ; b; c; ", sep: ";", expected: ["a", "b", "c", ""] },
            { input: "", sep: ",", expected: [""] },
        ];

        for (let i = 0; i < table.length; i++) {
            const { input, sep, expected } = table[i] as (typeof table)[number];
            test(`Should correctly convert "${input}" to array`, function () {
                expect(toArray(input, sep)).to.deep.equal(expected);
            });
        }

        test("Should throw a conversion error when unable to parse", function () {
            expect(() => toArray(1 as any, ",")).to.throw(ConversionError);
        });
    });

    suite("To Number", function () {
        const table = [
            { input: "   42    ", expected: 42 },
            { input: "-1.5", expected: -1.5 },
            { input: "0", expected: 0 },
        ];

        test("Should correctly convert valid number strings to numbers", function () {
            for (let i = 0; i < table.length; i++) {
                const { input, expected } = table[i] as (typeof table)[number];

                expect(toNumber(input)).to.equal(expected);
            }
        });

        test("Should throw ConversionError for invalid number string", function () {
            expect(() => toNumber("not a number")).to.throw(ConversionError);
        });

        test("Should throw ConversionError for an empty string", function () {
            expect(() => toNumber("")).to.throw(ConversionError);
        });
    });
});
