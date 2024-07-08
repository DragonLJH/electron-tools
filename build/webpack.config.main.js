const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const mainConfig = {
  mode: "development",
  entry: {
    main: path.join(__dirname, "../main/index.js"),
    preload: path.join(__dirname, "../main/preload/index.js"),
  },
  //   devtool: "electron-main",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "../dist/main"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    clean: true,
  },
  watch: true,
};

module.exports = merge(baseConfig, mainConfig);
