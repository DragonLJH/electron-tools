const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
console.log(process.env.NODE_ENV);
const isProd = process.env.NODE_ENV === "production";
const mainConfig = {
  mode: process.env.NODE_ENV,
  entry: {
    main: path.join(__dirname, "../main/main.js"),
    preload: path.join(__dirname, "../main/preload/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "../dist/main"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    clean: true,
  },
};
isProd || (mainConfig["devtool"] = "source-map");
isProd || (mainConfig["watch"] = true);

isProd && (mainConfig["target"] = "electron-main"); // 确保目标设置为 electron-main
module.exports = merge(baseConfig, mainConfig);
