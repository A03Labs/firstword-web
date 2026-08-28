import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        // Mirrors the `@/*` path alias in tsconfig.json so the tests import the
        // route handlers exactly as the app does.
        alias: { "@": path.resolve(import.meta.dirname, "src") },
    },
    test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
        // The whole-Bible integrity test walks 2,380 generated files.
        testTimeout: 60_000,
    },
});
