const { app } = require("electron");
const { initWin } = require("./mainWindow");
const { ipcFun } = require("./ipc");
let winList = new Map();
let win;
app.on("ready", () => {
  win = initWin();
  winList.set("Home", win);
  ipcFun(win, winList);
});
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  }
);
app.on("before-quit", () => {
  console.log("app before-quit");
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", function () {
  console.log("activate");
});
app.on("quit", function () {
  console.log("quit");
  // win.destroy();
});
app.on("will-quit", function () {
  console.log("will-quit");
});
app.on("will-finish-launching", function () {
  console.log("will-finish-launching");
});
