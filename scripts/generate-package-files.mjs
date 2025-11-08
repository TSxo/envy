// scripts/generate-package-files.js
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function generatePackageFiles() {
    const esmDir = "dist/esm";
    const cjsDir = "dist/cjs";

    // Check if directories exists
    if (!existsSync("dist")) {
        console.error(
            "❌ Error: dist directory does not exist. Please run the build first.",
        );
        process.exit(1);
    }

    if (!existsSync(esmDir)) {
        console.error(
            "❌ Error: ESM build directory does not exist. Please run the build first.",
        );
        process.exit(1);
    }

    if (!existsSync(cjsDir)) {
        console.error(
            "❌ Error: CJS build directory does not exist. Please run the build first.",
        );
        process.exit(1);
    }

    // Package.json contents
    const esmPackageJson = {
        type: "module",
        sideEffects: false,
    };

    const cjsPackageJson = {
        type: "commonjs",
        sideEffects: false,
    };

    try {
        // Write package.json files
        writeFileSync(
            join(esmDir, "package.json"),
            JSON.stringify(esmPackageJson, null, 4),
        );
        writeFileSync(
            join(cjsDir, "package.json"),
            JSON.stringify(cjsPackageJson, null, 4),
        );

        console.log("✅ Generated package.json files for ESM and CJS");
    } catch (error) {
        console.error("❌ Error generating package.json files:", error);
        process.exit(1);
    }
}

generatePackageFiles();
