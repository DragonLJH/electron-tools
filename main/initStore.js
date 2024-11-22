const { ipcMain, BrowserWindow } = require("electron");
const store = require("./store/index.js");
class InitStore {
  _action;
  _sederWin;
  constructor() {}
  get state() {
    return store.getState();
  }
  init() {
    store.subscribe(() => {
      // 向所有窗口发送状态更新
      BrowserWindow.getAllWindows().forEach((window) => {
        if (
          window !== this._sederWin &&
          this._action.type !== "ROUTE_INIT_ACTION"
        ) {
          window.webContents.send("store-updated", this._action);
        }
      });
    });
    // 返回 Redux state
    ipcMain.on("get-state", (event) => {
      event.sender.send("state-response", {
        state: this.state,
      });
    });

    // 处理来自渲染进程的 action 请求
    ipcMain.on("dispatch-action", (event, action) => {
      this._sederWin = BrowserWindow.fromWebContents(event.sender);
      console.log("[dispatch-action action]", action);
      this._action = action;
      store.dispatch(action);
    });
  }
}

const initStore = new InitStore();

module.exports = { initStore };
