import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
    root: "src/widgets",
    plugins: [react(), viteStaticCopy({
        targets: [
            { src: "src/backend.js", dest: ".." },
            { src: "src/logo.svg", dest: ".." },
            { src: "src/manifest.json", dest: ".." },
            { src: "src/settings.json", dest: ".." },
        ]
    })],
    build: {
        outDir: "../../build/widgets",
        assetsDir: "",
        assetsInlineLimit: 0,
        emptyOutDir: true
    },
    esbuild: {
        supported: {
            "top-level-await": true
        }
    },
});
