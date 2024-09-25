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

const copyFolder = (source, destination) => {
  if (!fs.existsSync(source)) {
    throw new Error(`源文件夹 ${source} 不存在。`);
  }
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  const items = fs.readdirSync(source);
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destinationPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      copyFolder(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
};

const initAssets = async () => {
  try {
    console.log("initAssets start");
    const assetsPath = path.join(__dirname, "../../assets");
    // 检查输出文件夹是否存在
    if (!fs.existsSync(assetsPath)) {
      fs.mkdirSync(assetsPath, { recursive: true });
    }
    await Promise.all(
      ["exe", "src/imgs"]
        .map((itemPath) => [
          path.join(__dirname, `../../${itemPath}`),
          path.join(assetsPath, path.basename(itemPath)),
        ])
        .map(
          async ([source, destination]) => await copyFolder(source, destination)
        )
    );
    console.log("initAssets success!");
  } catch (error) {
    console.error("initAssets error:", error);
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

  await cleanOutput(path.join(__dirname, "../../assets"));
  await cleanOutput(path.join(__dirname, "../../", output));
  Object.entries(devServerOptions).forEach(([key, value]) => {
    process.env[key] = value;
  });
  Promise.all([initAssets(), buildMain(), buildRenderer()])
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
