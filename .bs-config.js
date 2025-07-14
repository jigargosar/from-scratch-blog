module.exports = {
  server: {
    baseDir: "docs",
    serveStaticOptions: {
      extensions: ["html"],
    },
  },
  online: false,
  files: ["docs/**/*.html", "docs/**/*.css", "docs/**/*.js"],
  reloadDebounce: 400,
  notify: true,
  ui: false,
  open: true,
  ghostMode: false,
  logPrefix: "🛠 Blog",
  historyApiFallback: false,
};