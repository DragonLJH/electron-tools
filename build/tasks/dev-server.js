const { spawn } = require("child_process");
const electron = require("electron");
const path = require("path");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfigMain = require("../webpack.config.main");
const webpackConfigRenderer = require("../webpack.config.renderer");

const rootPath = process.cwd();
const devServerOptions = {
  host: "localhost",
  port: 3003,
  hot: true,
  proxy: {},
  historyApiFallback: true,
  compress: true,
  allowedHosts: "all",
  static: {
    directory: path.resolve(rootPath, "assets"),
    publicPath: "/assets",
  },
  client: {
    logging: "warn",
    overlay: true,
    progress: true,
  },
  devMiddleware: {
    publicPath: "",
  },
};
class ElectronProcess {
  process;
  constructor() {}
  start() {
    if (this.process && this.process.pid) {
      try {
        process.kill(this.process.pid);
        this.process = undefined;
      } catch (error) {
        console.error("ElectronProcess-kill-error:", error);
      }
    } else {
      console.error("Failed to restart: Main process does not exist.");
    }
    this._startElectron();
  }
  _startElectron() {
    this.process = spawn(electron, ["main/main.js"]);
    this.process.stdout.on("data", (data) => {
      let message = data.toString();
      console.log("ElectronProcess-stdout:", message.toString());
    });
    this.process.stderr.on("data", (data) => {
      console.log("ElectronProcess-stderr:", data.toString());
    });
    this.process.on("close", () => {
      if (!this.restarting) {
        this.process = undefined;
        process.exit();
      }
    });
  }
}
const startMain = () => {
  const electronProcess = new ElectronProcess();
  webpack(webpackConfigMain, (err, stats) => {
    electronProcess.start();
  });
};

const startRenderer = async () => {
  const rendererCompiler = webpack(webpackConfigRenderer);
  const server = new WebpackDevServer(devServerOptions, rendererCompiler);
  await server.start().catch((err) => {
    if (err) {
      console.error("Dev Server failed to activate.", err);
    }
  });
};
const isObject = (target) =>
  Object.prototype.toString.call(target) === "[object Object]";
(async () => {
  Object.entries(devServerOptions).forEach(([key, val]) => {
    if (isObject(val)) process.env[key] = JSON.stringify(val);
    else process.env[key] = val;
  });
  startMain();
  await startRenderer();
  console.log("dev server 正在运行");
})();
