const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcR", {
  ipcMaximize: (routePath) => {
    ipcRenderer.send("ipc-maximize", routePath);
  },
  ipcUnmaximize: (routePath) => {
    ipcRenderer.send("ipc-unmaximize", routePath);
  },
  ipcMinimize: (routePath) => {
    ipcRenderer.send("ipc-minimize", routePath);
  },
  ipcClose: (winKey) => {
    ipcRenderer.send("ipc-close", winKey);
  },
  ipcReload: (winKey) => {
    ipcRenderer.send("ipc-reload", winKey);
  },
  ipcIsMaximized: (routePath) =>
    ipcRenderer.invoke("ipc-isMaximized", routePath),
  ipcGetParentWindow: (routePath) =>
    ipcRenderer.invoke("ipc-getParentWindow", routePath),
  ipcDialogOpen: (data) => ipcRenderer.invoke("ipc-dialogOpen", data),
  ipcReadFile: (path) => ipcRenderer.invoke("ipc-readFile", path),
  ipcAppPath: () => ipcRenderer.invoke("ipc-appPath"),
  ipcCreatewin: ({ routeOp, routePath, winKey }) =>
    routeOp.isCreate &&
    ipcRenderer.send("ipc-createwin", { winKey, routeOp, routePath }),
  ipcGetWin: (routePath) => ipcRenderer.invoke("ipc-getWin", routePath),
});

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // 除函数之外，我们也可以暴露变量
});
