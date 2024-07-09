const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { NODE_ENV, host, port } = process.env;
const URL = `http://${host}:${port}/`;
const isDevelopment = NODE_ENV === "development";

const webPreferences = {
  nodeIntegration: true,
  plugins: true,
  // contextIsolation: false,
  // webviewTag: true,
  webSecurity: false,
  enableRemoteModule: true,
};
if (isDevelopment) {
  webPreferences.preload = path.resolve(__dirname, "preload/index.js");
} else {
  webPreferences.preload = path.resolve(__dirname, "preload.js");
}

const DEFAULT_WINDOW_OPTIONS = {
  minWidth: 200,
  minHeight: 200,
  width: 800,
  height: 600,
  show: false,
  hasShadow: true,
  webPreferences: webPreferences,
  titleBarStyle: "hidden",
  trafficLightPosition: { x: 10, y: 23 },
};

const HOME_WIN_OPTIONS = {
  width: 1160,
  height: 752,
  minHeight: 632,
  minWidth: 960,
  show: false,
  frame: false,
  title: "Electron",
  // alwaysOnTop: true, // 设置窗口置顶
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false,
  },
  titleBarStyle: "hidden",
  trafficLightPosition: { x: 10, y: 23 },
};
const initWin = () => createwin(HOME_WIN_OPTIONS, URL);
const createwin = (winOp, url) => {
  console.log("createwin", url);
  let win = new BrowserWindow(mergeObj(DEFAULT_WINDOW_OPTIONS, winOp));
  if (isDevelopment) {
    win.loadURL(url);
  } else {
    const entryPath = path.resolve(__dirname, "../../dist/index.html");
    win.loadFile(entryPath);
  }

  // 打开开发者工具栏，默认不打开
  win.webContents.openDevTools();

  win.once("ready-to-show", () => {
    win.show();
  });

  // 监听拖拽事件
  win.webContents.on("will-navigate", (e, url) => {
    e.preventDefault();
    console.log("拖拽文件:", url);
  });

  return win;
};

const mergeObj = (m1, m2) => {
  const res = { ...m1 };
  Object.entries(m2).forEach(([k, v]) => {
    if (
      Object.prototype.toString.call(v) === "[object Object]" &&
      Object.prototype.toString.call(res[k]) === "[object Object]"
    ) {
      res[k] = mergeObj(m1[k], v);
    } else {
      res[k] = v;
    }
  });
  return res;
};

module.exports = { initWin, createwin, URL };
