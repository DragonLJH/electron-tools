const { createwin, URL } = require("./mainWindow");
const { app, ipcMain, dialog } = require("electron");
const { PythonShell, NewlineTransformer } = require("python-shell");
const { spawn, execSync } = require("child_process");
const { HttpsProxyAgent } = require("https-proxy-agent");
const resourceHacker = require("node-resourcehacker");
// import got from "got";

const fs = require("fs");
const path = require("path");
const ipcFun = (win, winList) => {
  let electronDownloadPath, rcFilePath;
  ipcMain.on("ipc-maximize", (_, routePath) => {
    winList.get(routePath).maximize();
  });
  ipcMain.on("ipc-unmaximize", (_, routePath) => {
    winList.get(routePath).unmaximize();
  });
  ipcMain.on("ipc-minimize", (_, routePath) => {
    winList.get(routePath).minimize();
  });
  ipcMain.on("ipc-close", (_, winKey) => {
    winList.get(winKey).close();
    winList.delete(winKey);
  });
  ipcMain.on("ipc-reload", (_, winKey) => {
    winList.get(winKey).reload();
  });
  ipcMain.handle("ipc-isMaximized", (_, routePath) =>
    winList.get(routePath).isMaximized()
  );
  ipcMain.handle("ipc-getParentWindow", (_, routePath) =>
    winList.get(routePath).getParentWindow() ? true : false
  );
  ipcMain.handle("ipc-dialogOpen", (_, { properties, filters }) => {
    console.log("ipcMain-dialogOpen", { properties, filters });
    return new Promise((resolve, reject) => {
      dialog
        .showOpenDialog(win, {
          properties,
          filters,
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.error("dialogOpen：", err);
        });
    });
  });
  ipcMain.handle("ipc-readFile", (_, path) => fs.readFileSync(path));
  ipcMain.handle("ipc-appPath", (_) => app.getAppPath());
  ipcMain.on("ipc-createwin", (_, { winKey, routeOp, routePath }) => {
    let win = createwin(
      { routeOp, parent: winList.get("Home") },
      `${URL}#${routePath}`
    );
    win.id = winKey;
    console.log("ipc-createwin-key:", winKey);
    winList.set(winKey, win);
  });
  ipcMain.handle("ipc-getWin", (_, routePath) => routePath);
  // 处理安装库的请求
  // ipcMain.handle(
  //   "install-library",
  //   async (event, libraryName, libraryVersion) => {
  //     return new Promise((resolve, reject) => {
  //       PythonShell.run(
  //         "./py/install_library.py",
  //         {
  //           args: [libraryName, libraryVersion],
  //         },
  //         (err, result) => {
  //           if (err) {
  //             reject(`Error: ${err}`);
  //           } else {
  //             resolve(result.join("\n"));
  //           }
  //         }
  //       );
  //     });
  //   }
  // );
  // 添加执行 Python 脚本的代码
  ipcMain.on(
    "ipc-execute-python-script",
    (event, scriptPath = "../py/example.py") => {
      const script = path.join(__dirname, "../py/example.py");
      console.log("ipc-execute-python-script", scriptPath);
      console.log(
        "ipc-execute-python-script-path",
        path.join(__dirname, "../py/example.py")
      );

      PythonShell.run(scriptPath)
        .then((results) => {
          console.log(" python results", results);
          event.reply("python-script-output", { output: results.join("\n") });
        })
        .catch((err) => {
          console.log(" python err", err);
          event.reply("python-script-output", { error: err.message });
        });
    }
  );
  ipcMain.on("ipc-execute-python-script2", (event) => {
    const scriptPath = path.join(__dirname, "../py/example2.py");
    let pyshell = new PythonShell(scriptPath, {
      mode: "text",
      pythonPath: "python", // 替换为你的Python路径
      args: ["arg1", "arg2"],
    });
    pyshell.stderr.on("data", function (data) {
      console.log("pyshell stderr: " + data);
    });
    pyshell.on("message", function (message) {
      console.log(message);
    });

    pyshell.end((err) => {
      if (err) throw err;
      console.log("Finished");
    });
  });
  ipcMain.on("ipc-execute-python-script3", (event) => {
    const scriptPath = path.join(__dirname, "../py/example3.py");

    let options = {
      mode: "text",
      pythonPath: "python",
      // pythonOptions: ["-m", "castlabs_evs.account", "reauth"],
      args: ["loongjh", "Long1234."],
    };

    let pyshell = new PythonShell(scriptPath, options);

    pyshell.on("message", (message) => {
      console.log(message);
    });

    pyshell.on("error", (err) => {
      console.error(err);
    });

    pyshell.end((err) => {
      if (err) throw err;
      console.log("Finished");
    });
  });

  ipcMain.on("ipc-execute-python-script4", async (event) => {
    const gotModule = await import("got");
    const got = gotModule.default;
    const streamData = [];
    const proxyUrl = "http://127.0.0.1:7890";
    const _agent = new HttpsProxyAgent(proxyUrl);
    const downloadPath = path.join(
      __dirname,
      "../downloads",
      "electron-v11.3.0-wvvmp-win32-x64.zip"
    );
    const downloadStream = got(
      "https://github.com/castlabs/electron-releases/releases/download/v11.3.0-wvvmp/electron-v11.3.0-wvvmp-win32-x64.zip",
      {
        isStream: true,
        agent: {
          http: _agent,
          https: _agent,
        },
      }
    );
    const fileStream = fs.createWriteStream(downloadPath);
    downloadStream.pipe(fileStream);
    downloadStream.once("response", (response) => {
      console.log("response");
    });
    downloadStream.on("data", (chunk) => {
      streamData.push(chunk);
    });
    downloadStream.on("downloadProgress", (progress) => {
      console.log("downloadProgress", progress);
    });
    downloadStream.once("end", (...e) => {
      console.log("end");
      console.log("end-streamData:", streamData);
    });
    downloadStream.once("error", (error) => {
      console.log("error", error);
    });
  });
  const expandArchive = (zipPath) => {
    electronDownloadPath = zipPath.replace(".zip", "");
    return new Promise((resolve, reject) => {
      const command = `Expand-Archive -Path "${zipPath}" -DestinationPath "${electronDownloadPath}"`;
      const powershell = spawn("powershell.exe", ["-Command", command]);
      powershell.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      powershell.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      powershell.on("close", (code) => {
        if (code === 0) {
          console.log(`Successfully, code ${code}`);
          resolve();
        } else {
          console.log(`Failed, code ${code}`);
          reject(new Error(`Failed, code ${code}`));
        }
      });
    });
  };
  ipcMain.on("ipc-execute-python-script5", async (event) => {
    const fileName = "electron-v11.3.0-wvvmp-win32-x64";
    const zipPath = path.join(__dirname, "../downloads", `${fileName}.zip`),
      destinationPath = path.join(__dirname, "../downloads", fileName);
    const command = `Expand-Archive -Path "${zipPath}" -DestinationPath "${destinationPath}"`;
    const powershell = spawn("powershell.exe", ["-Command", command]);

    powershell.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    powershell.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    powershell.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });
  ipcMain.on("ipc-execute-python-script6", async (event) => {
    const electron = path.join(electronDownloadPath, "electron.exe"),
      signatureFile = path.resolve(
        "D:\\sign\\Yian Technology (Shenzhen) Co., Ltd..pfx"
      ),
      signaturePassword = "yian22()";
    const command = `signtool sign /f  "${signatureFile}" /p ${signaturePassword}  /t http://timestamp.digicert.com /fd SHA256 "${electron}"`;

    const cmd = spawn("cmd.exe", ["/c", command]);
    cmd.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    cmd.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
    cmd.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });

  ipcMain.on("ipc-got-download", async (event, data) => {
    const { url, isStream, callback } = data;
    const gotModule = await import("got");
    const got = gotModule.default;
    const streamData = [];
    const proxyUrl = "http://127.0.0.1:7890";
    const _agent = new HttpsProxyAgent(proxyUrl);
    const downloadName = url.split("/").slice(-1)[0];
    const downloadPath = path.join(__dirname, "../downloads", downloadName);
    const downloadStream = got(url, {
      isStream: isStream ?? false,
      agent: {
        http: _agent,
        https: _agent,
      },
    });

    let totalBytes = 0;
    let transferredBytes = 0;
    // const fileStream = fs.createWriteStream(downloadPath);
    // downloadStream.pipe(fileStream);
    downloadStream.once("response", (response) => {
      console.log("response");
      if (response.headers["content-length"]) {
        totalBytes = parseInt(response.headers["content-length"], 10);
      }
    });
    downloadStream.on("data", (chunk) => {
      streamData.push(chunk);
    });
    downloadStream.on("downloadProgress", (progress) => {
      // event.reply("download-progress", progress);
      // console.log("downloadProgress", progress);
      if (progress.total !== undefined) {
        totalBytes = progress.total;
      }
      transferredBytes = progress.transferred;
      const percent = totalBytes ? (transferredBytes / totalBytes) * 100 : 0;
      console.log(
        `Progress: ${percent.toFixed(
          2
        )}%, Transferred: ${transferredBytes}, Total: ${totalBytes}`
      );
    });
    downloadStream.once("end", async (...e) => {
      console.log("end");
      console.log("end-streamData:", streamData);
      const buffer = Buffer.concat(streamData);
      fs.writeFileSync(downloadPath, buffer);
      await expandArchive(downloadPath);
      event.reply("download-success");
    });
    downloadStream.once("error", (error) => {
      console.log("error", error);
    });
  });
  const exeExtractRc = (
    exePath = path.join(electronDownloadPath, "electron.exe"),
    rcPath = path.resolve(__dirname, "../downloads/temp.rc"),
    batPath = path.join(__dirname, "../exe/ExeExtractRc.bat"),
    rhPath = path.join(__dirname, "../exe/ResourceHacker.exe")
  ) => {
    return new Promise((resolve, reject) => {
      const extractProcess = spawn(batPath, [rhPath, exePath, rcPath]);
      extractProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      extractProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });
      extractProcess.on("close", (code) => {
        if (code === 0) {
          console.log(
            "extract successfully:",
            fs.readFileSync(rcPath, "utf-8")
          );
          resolve(rcPath);
        } else {
          console.error(`extract Failed, exit code: ${code}`);
          reject(new Error(`extract Failed, exit code: ${code}`));
        }
      });
    });
  };
  const rcHandle = (rcFilePath) => {
    return new Promise((resolve, reject) => {
      // 调用rc.exe编译器将rc文件转换为res文件
      const rcProcess = spawn("rc", [rcFilePath]);

      rcProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      rcProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });
      rcProcess.on("close", (code) => {
        if (code === 0) {
          console.log("RC file compiled successfully to RES file");
          resolve();
        } else {
          console.error(`Failed to compile RC file, exit code: ${code}`);
          reject(new Error(`Failed to compile RC file, exit code: ${code}`));
        }
      });
    });
  };
  const resourceHackerHandle = (resourceHacker, ScriptPath) => {
    return new Promise((resolve, reject) => {
      const scriptProcess = spawn(resourceHacker, ["-script", ScriptPath]);
      scriptProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      scriptProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });
      scriptProcess.on("close", (code) => {
        if (code === 0) {
          console.log("resourceHacker successfully");
          resolve();
        } else {
          console.error(`resourceHacker Failed, exit code: ${code}`);
          reject(new Error(`resourceHacker Failed, exit code: ${code}`));
        }
      });
    });
  };
  ipcMain.handle("ipc-get-exe-to-rc", async (event) => {
    const electron = path.join(electronDownloadPath, "electron.exe");
    rcFilePath = await exeExtractRc(electron);
    // 去除不可见字符（保留换行符）
    // 这里的正则表达式去除了除换行符和可见字符外的所有字符
    return fs.readFileSync(rcFilePath, "utf-8").replace(/[^\x20-\x7E\n]/g, "");
  });
  ipcMain.on("ipc-change-rc", async (event, rcContent) => {
    fs.writeFileSync(rcFilePath, rcContent, "utf-8");
    event.reply("change-rc-success");
  });
  ipcMain.on("ipc-change-exe", async (event) => {
    const electron = path.join(electronDownloadPath, "electron.exe");
    const resourceHacker = path.join(__dirname, "../exe", "ResourceHacker.exe");
    // 确保输出目录存在
    const outputDir = path.dirname(rcFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log(
      "downloadsPath:",
      path.resolve(__dirname, "../downloads"),
      path.join(__dirname, "../downloads")
    );
    const ScriptPath = path.resolve(__dirname, "../downloads/ScriptFile.txt");
    const iconPath = path.resolve(__dirname, "../downloads/icons.ico");
    const ScriptContent = `
[FILENAMES]
Exe=       ${electron}
SaveAs=    ${electron}
Log=       MyProg_Rus.log
[COMMANDS]
-addoverwrite    ${iconPath}, ICONGROUP, 1
-addoverwrite    ${rcFilePath.replace(".rc", ".res")} , VERSIONINFO, 1
`;
    fs.writeFileSync(ScriptPath, ScriptContent, "utf-8");
    try {
      await rcHandle(rcFilePath);
      await resourceHackerHandle(resourceHacker, ScriptPath);
      event.reply("change-exe-success");
    } catch (error) {
      event.reply("change-exe-err");
      console.error(error);
    }
  });
  ipcMain.on("ipc-digital-signature", async (event) => {
    const electron = path.join(electronDownloadPath, "electron.exe");

    // `signtool` 的路径
    const signtoolPath =
      "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x64\\signtool.exe";

    // 签名参数
    const signOptions = [
      "sign",
      "/f",
      "D:\\sign\\Yian Technology (Shenzhen) Co., Ltd..pfx", // 证书文件路径
      "/p",
      "yian22()", // 证书密码
      "/t",
      "http://timestamp.digicert.com", // 时间戳 URL
      "/fd",
      "SHA256", // 哈希算法
      "D:\\long\\dragon\\electron-react-base\\downloads\\electron-v11.3.0-wvvmp-win32-x64\\electron.exe", // 需要签名的文件路径
    ];

    // 启动 `signtool` 命令
    const signProcess = spawn(signtoolPath, signOptions);

    // 处理 `signtool` 的输出
    signProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    signProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    signProcess.on("close", (code) => {
      if (code === 0) {
        console.log("签名成功");
        event.reply("digital-signature-success");
      } else {
        console.error(`签名失败，退出码 ${code}`);
        event.reply("digital-signature-err");
      }
    });
  });
  ipcMain.on("ipc-wvp-signature", (event) => {
    const scriptPath = path.join(__dirname, "../exe/wvp.py");

    let options = {
      mode: "text",
      pythonPath: "python",
      // pythonOptions: ["-m", "castlabs_evs.account", "reauth"],
      args: ["loongjh", "Long1234.", electronDownloadPath],
    };

    let pyshell = new PythonShell(scriptPath, options);

    pyshell.on("message", (message) => {
      console.log(message);
    });

    pyshell.on("error", (err) => {
      console.error(err);

      event.reply("wvp-signature-err");
    });

    pyshell.end((err) => {
      if (err) throw err;
      console.log("Finished");
      event.reply("wvp-signature-success");
    });
  });
};

module.exports = { ipcFun };
