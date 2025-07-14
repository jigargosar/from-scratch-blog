module.exports = {
  server: {
    baseDir: "docs",
    serveStaticOptions: {
      extensions: ["html"],
    },
  },
  files: ["docs/**/*.html", "docs/**/*.css", "docs/**/*.js"],
  reloadDebounce: 400,
  notify: true,
  ui: false,
  open: true,
  ghostMode: true,
  logPrefix: "🛠 Blog",
  historyApiFallback: false,
};