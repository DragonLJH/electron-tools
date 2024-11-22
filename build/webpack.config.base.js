const path = require("path");
const { DefinePlugin } = require("webpack");
const dotenv = require("dotenv");
const DotEnvPlugin = require("dotenv-webpack");
const rootPath = process.cwd();
// dotenv.config({ path: path.resolve(rootPath, ".env") });
module.exports = {
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "../src"),
      "@store": path.resolve(__dirname, "../store"),
      "@main": path.resolve(__dirname, "../main"),
      "@assets": path.resolve(__dirname, "../assets"),
    },
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new DefinePlugin(
      (() => {
        return {};
      })()
    ),

    // new DotEnvPlugin({ path: path.resolve(rootPath, ".env") }),
  ],
};
