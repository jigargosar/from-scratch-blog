import { defineConfig } from "vite";
import Run from "vite-plugin-run";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "docs"), // serve final output
  //   publicDir: false, // disable asset pipeline
  publicDir: path.resolve(__dirname, "src/assets"), // disable asset pipeline
  server: {
    open: true,
    watch: {
      ignored: ["**/docs/**"], // prevent reload loops
    },
  },
  plugins: [
    Run({
      name: "Build on source change",
      watch: ["src/**/*.pug", "src/posts/**/*.md"],
      run: ["node", "src/build.js"], // absolute control over build
    }),
  ],
});
