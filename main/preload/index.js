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
  ipcReadFile: ({ path, encoding }) =>
    ipcRenderer.invoke("ipc-readFile", { path, encoding }),
  ipcAppPath: () => ipcRenderer.invoke("ipc-appPath"),
  ipcCreatewin: ({ routeOp, routePath, winKey }) =>
    routeOp.isCreate &&
    ipcRenderer.send("ipc-createwin", { winKey, routeOp, routePath }),
  ipcGetWin: (routePath) => ipcRenderer.invoke("ipc-getWin", routePath),
  ipcGotDownload: ({ url, isStream, callback, progressCallback }) => {
    const isProgress = (progressCallback ?? false) && true;
    ipcRenderer.send("ipc-got-download", { url, isStream, isProgress });
    ipcRenderer.on("download-progress", (event, percent) => {
      progressCallback(percent);
    });
    ipcRenderer.on("download-res", (event, { code, result, msg }) => {
      callback({ code, result, msg });
    });
  },
  ipcDiscontinue: () => ipcRenderer.invoke("ipc-discontinue"),
  ipcDiscontinueChange: () => ipcRenderer.send("ipc-discontinue-change"),
  ipcChangeExe: ({ iconPath }, callback) => {
    ipcRenderer.send("ipc-change-exe", { iconPath });
    ipcRenderer.on("change-exe-res", (event, { code, result, msg }) => {
      callback({ code, result, msg });
    });
  },
  ipcGetExeToRc: () => ipcRenderer.invoke("ipc-get-exe-to-rc"),
  ipcChangeRc: (rcContent, callback) => {
    ipcRenderer.send("ipc-change-rc", rcContent);
    ipcRenderer.on("change-rc-success", (event) => {
      callback("success");
    });
  },
  ipcDigitalSignature: ({ signaturePath, signaturePwd }, callback) => {
    console.log("[ipcDigitalSignature { signaturePath, signaturePwd }]", {
      signaturePath,
      signaturePwd,
    });
    ipcRenderer.send("ipc-digital-signature", {
      signaturePath: signaturePath.value,
      signaturePwd: signaturePwd.value,
    });
    ipcRenderer.on("digital-signature-res", callback);
  },
  ipcWvpSignature: ({ accountName, password }, callback) => {
    ipcRenderer.send("ipc-wvp-signature", {
      accountName: accountName.value,
      password: password.value,
    });
    ipcRenderer.on("wvp-signature-res", (event, { code, result }) => {
      callback({ code, result });
    });
  },
  ipcExpandArchive: ({ targetPath, callback }) => {
    ipcRenderer.send("ipc-expand-archive", targetPath);
    ipcRenderer.on("expand-archive-res", (event, { code, result }) => {
      callback({ code, result });
    });
  },
  ipcSetOutputPath: (path) => {
    console.log("[ipcSetOutputPath]", path);
    ipcRenderer.send("ipc-set-output-path", path);
  },
  ipcEnv: () => ipcRenderer.invoke("ipc-get-env"),

  getState: () =>
    new Promise((resolve) => {
      ipcRenderer.once("state-response", (event, { state }) => {
        resolve({ state });
      });
      ipcRenderer.send("get-state");
    }),

  dispatchAction: (action) => ipcRenderer.send("dispatch-action", action),
  onStoreUpdated: (callback) => {
    ipcRenderer.on("store-updated", (event, action) => {
      callback(action);
    });
  },
  onInitializeState: (callback) =>
    ipcRenderer.on("initialize-state", (event, initialState) =>
      callback(initialState)
    ),
});

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // 除函数之外，我们也可以暴露变量
});
