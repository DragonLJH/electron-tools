const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "../src"),
      "@main": path.resolve(__dirname, "../main"),
    },
    extensions: [".js", ".jsx"],
  },
};
