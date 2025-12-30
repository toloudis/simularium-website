import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import rawLoader from "./vite-plugin-raw-loader.js";
import postcssFlexbugsFixes from "postcss-flexbugs-fixes";
import postcssPresetEnv from "postcss-preset-env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package versions
const packageJson = JSON.parse(
    await import("fs").then((fs) =>
        fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
    )
);
const viewerPackageJson = JSON.parse(
    await import("fs").then((fs) =>
        fs.readFileSync(
            path.join(__dirname, "../simularium-viewer/package.json"),
            "utf-8"
        )
    )
);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isProd = mode === "production" || mode === "staging";
    const backendServerIP =
        mode === "production"
            ? "production-simularium-ecs.allencell.org"
            : "staging-simularium-ecs.allencell.org";

    return {
        plugins: [react(), rawLoader()],
        base: "./", // Relative paths for Electron file:// loading
        define: {
            // Environment variables (replaces webpack.DefinePlugin)
            SIMULARIUM_BUILD_ENVIRONMENT: JSON.stringify(mode),
            SIMULARIUM_WEBSITE_VERSION: JSON.stringify(packageJson.version),
            SIMULARIUM_VIEWER_VERSION: JSON.stringify(
                viewerPackageJson.version
            ),
            "process.env.GH_BUILD": JSON.stringify(
                !!process.env.GH_BUILD || false
            ),
            "process.env.GOOGLE_API_KEY": JSON.stringify(
                process.env.GOOGLE_API_KEY ||
                    "AIzaSyAZ3ow-AhfTcOsBml7e3oXZ7JwqIATcGwU"
            ),
            "process.env.BACKEND_SERVER_IP": JSON.stringify(backendServerIP),
        },
        build: {
            outDir: "dist",
            sourcemap: !isProd,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: [
                            "react",
                            "react-dom",
                            "react-redux",
                            "redux",
                            "react-router-dom",
                        ],
                    },
                },
            },
        },
        css: {
            modules: {
                localsConvention: "camelCase",
                scopeBehaviour: "local",
                generateScopedName: "[name]__[local]--[hash:base64:5]",
            },
            postcss: {
                plugins: [
                    postcssFlexbugsFixes,
                    postcssPresetEnv({
                        autoprefixer: {
                            flexbox: "no-2009",
                        },
                    }),
                ],
            },
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
            alias: {
                // Force single React instance - prevents hooks errors
                react: path.resolve(__dirname, "node_modules/react"),
                "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
            },
        },
        server: {
            port: 9006,
            host: "localhost",
        },
    };
});
