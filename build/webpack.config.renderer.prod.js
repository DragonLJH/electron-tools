const path = require("path");

const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { NODE_ENV } = process.env;
const rendererConfig = {
  mode: "production",
  entry: path.join(__dirname, "../src/index.jsx"),
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "../dist/renderer"),
    filename: "js/bundle.js",
    library: "index",
    libraryTarget: "umd", // 采用通用模块定义
    libraryExport: "default", // 兼容 ES6 的模块系统、CommonJS 和 AMD 模块规范
    clean: true,
    publicPath: "./",
  },
  plugins: [
    new HtmlWebpackPlugin({
      // title: 'Development',
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      filename: "main.min.css", // 提取后的css的文件名
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s?([ac])ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
        exclude: /\.min\.css$/,
      },
      {
        test: /\.(js|jsx)$/i,
        use: ["babel-loader"],
      },
    ],
  },
};
if (NODE_ENV === "development") {
  rendererConfig.devtool = "source-map";
}
module.exports = merge(baseConfig, rendererConfig);
