/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            exclude: [
                ...(configDefaults.coverage.exclude || []),
                "**/node_modules/**",
                "**/tests/**",
                "**/index.ts",
                "./src/types.ts",
            ],
        },
    },
});
