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
  ipcGotDownload: ({ url, isStream, callback }) => {
    ipcRenderer.send("ipc-got-download", { url, isStream });
    // ipcRenderer.on("download-progress", (event, progress) => {
    //   callback(progress);
    // });
    ipcRenderer.on("download-success", (event) => {
      callback("success");
    });
  },
  ipcChangeExe: ({ brand, productName, date, callback }) => {
    ipcRenderer.send("ipc-change-exe", { brand, productName, date });
    ipcRenderer.on("change-exe-success", (event) => {
      callback("success");
    });
    ipcRenderer.on("change-exe-err", (event) => {
      callback("err");
    });
  },
  ipcGetExeToRc: () => ipcRenderer.invoke("ipc-get-exe-to-rc"),
  ipcChangeRc: (rcContent, callback) => {
    ipcRenderer.send("ipc-change-rc", rcContent);
    ipcRenderer.on("change-rc-success", (event) => {
      callback("success");
    });
  },
  ipcDigitalSignature: (callback) => {
    ipcRenderer.send("ipc-digital-signature");
    ipcRenderer.on("digital-signature-success", (event) => {
      callback("success");
    });
    ipcRenderer.on("digital-signature-err", (event) => {
      callback("err");
    });
  },
  ipcWvpSignature: (callback) => {
    ipcRenderer.send("ipc-wvp-signature");
    ipcRenderer.on("wvp-signature-success", (event) => {
      callback("success");
    });
    ipcRenderer.on("wvp-signature-err", (event) => {
      callback("err");
    });
  },
});

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // 除函数之外，我们也可以暴露变量
});
