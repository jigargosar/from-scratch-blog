import { defineConfig } from "vite";
import Run from "vite-plugin-run";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "docs"),
  publicDir: false,
  server: {
    open: true,
    watch: {
      ignored: ["**/docs/**"], // avoids infinite reload loops
    },
  },
  plugins: [
    Run({
      name: "Rebuild static site",
      watch: ["src/**/*.pug", "src/posts/**/*.md"],
      run: ["node", "src/build.js"],
    }),
  ],
});
