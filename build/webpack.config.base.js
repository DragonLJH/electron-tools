const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "../src"),
      "@main": path.resolve(__dirname, "../main"),
      "@assets": path.resolve(__dirname, "../assets"),
    },
    extensions: [".js", ".jsx"],
  },
};
