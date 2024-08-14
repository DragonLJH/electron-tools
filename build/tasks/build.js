const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const webpack = require("webpack");
const webpackConfigMain = require("../webpack.config.main");
const webpackConfigRenderer = require("../webpack.config.renderer.prod");

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
  },
  client: {
    logging: "warn",
    overlay: true,
    progress: true,
  },
};

const cleanOutput = async (folderPath) => {
  try {
    await fsPromises.rm(folderPath, { recursive: true, force: true });
  } catch (err) {
    console.error(`Error while deleting ${folderPath}:`, err);
  }
};

const buildMain = () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfigMain, (err, stats) => {
      if (err) throw err;
      if (!stats) throw "buildMain states error!";
      console.info("buildMain success!");
      resolve();
    });
  });
};

const buildRenderer = () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfigRenderer, (err, stats) => {
      if (err) throw err;
      if (!stats) throw "buildRenderer states error!";
      console.info("buildRenderer success!");
      resolve();
    });
  });
};

(async () => {
  const time = Date.now();
  // 读取 package.json 文件
  const packageJsonPath = path.join(__dirname, "../../package.json");
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
  const { output } = JSON.parse(packageJsonContent)?.build?.directories;

  cleanOutput(path.join(__dirname, "../../", output));
  Object.entries(devServerOptions).forEach(([key, value]) => {
    process.env[key] = value;
  });
  Promise.all([buildMain(), buildRenderer()])
    .then(() => {
      console.info(
        `[Building...] : 构建完成 ✌️🙌 in ${Math.floor(
          (Date.now() - time) / 1000
        )}s`
      );
    })
    .catch((err) => {
      throw new Error(err);
    });
  return;
})();
