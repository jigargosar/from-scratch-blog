import { defineConfig } from "vite";
import Run from "vite-plugin-run";

export default defineConfig({
  root: "./src",
  publicDir: "assets",
  server: {
    open: true,
    watch: {
      ignored: ["../docs/**"], // avoids looping on output files
    },
  },
  plugins: [
    Run({
      name: "Rebuild site",
      watch: ["**/*.pug", "posts/**/*.md"],
      run: "node build.js",
    }),
  ],
});
