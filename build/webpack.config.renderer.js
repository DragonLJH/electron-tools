const path = require("path");

const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.config.base");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { NODE_ENV } = process.env;
const rendererConfig = {
  mode: NODE_ENV,
  entry: path.join(__dirname, "../src/index.jsx"),
  // devtool: "source-map",
  output: {
    filename: "js/bundle.js",
    path: path.resolve(__dirname, "../dist/renderer"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      // title: 'Development',
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, "../public/index.html"),
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
