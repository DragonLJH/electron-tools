const { ipcMain } = require("electron");
const { PythonShell } = require("python-shell");
const { spawn, execSync, exec } = require("child_process");
const { HttpsProxyAgent } = require("https-proxy-agent");
const fs = require("fs");
const logging = require("electron-log");
const path = require("path");
const { deleteFolderRecursive, getProxyAddress } = require("./commonFn");
const assetsPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(process.resourcesPath, "assets")
    : path.join(__dirname, "../assets");

const proxySelf = getProxyAddress();
class UpdateExe {
  electronDownloadPath;
  rcFilePath;
  proxyUrl;
  // proxyUrl;
  signtoolPath = path.join(assetsPath, "exe", "signtool.exe");
  pythonPath = path.join(assetsPath, "exe", "python/python37.dll");
  constructor() {}
  init() {
    ipcMain.on("ipc-got-download", async (event, data) => {
      this.checkProxy();
      if (!this.proxyUrl) {
        event.reply("download-res", { code: -1, result: "failure" });
        return;
      }
      logging.log("ipc-got-download", this.proxyUrl);
      const gotModule = await import("got");
      const got = gotModule.default;
      const { url, isStream, isProgress } = data;
      const streamData = [];
      const downloadName = url.split("/").slice(-1)[0];
      const downloadPath = path.join(assetsPath, "downloads", downloadName);
      const options = {
        isStream: isStream ?? false,
        agent: {
          http: new HttpsProxyAgent(this.proxyUrl),
          https: new HttpsProxyAgent(this.proxyUrl),
        },
      };
      const downloadStream = got(url, options);

      // const fileStream = fs.createWriteStream(downloadPath);
      // downloadStream.pipe(fileStream);
      downloadStream.once("response", (response) => {
        logging.log("response");
      });
      downloadStream.on("data", (chunk) => {
        streamData.push(chunk);
      });
      downloadStream.on("downloadProgress", (progress) => {
        const { percent, total } = progress;
        console.log("downloadProgress", { percent, total });
        isProgress && total && event.reply("download-progress", percent);
      });
      downloadStream.once("end", async (...e) => {
        logging.log("end-downloadPath", downloadPath);
        // 获取目标目录
        const targetDir = path.dirname(downloadPath);
        logging.log("end-targetDir", targetDir, fs.existsSync(targetDir));
        // 确保目标目录存在
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const buffer = Buffer.concat(streamData);
        fs.writeFileSync(downloadPath, buffer);
        await this.expandArchive(downloadPath);
        event.reply("download-res", { code: 0, result: "success" });
      });
      downloadStream.once("error", (error) => {
        logging.log("error", error);
        event.reply("download-res", { code: -1, result: "failure" });
      });
    });

    ipcMain.handle("ipc-get-exe-to-rc", async (event) => {
      const electron = path.join(this.electronDownloadPath, "electron.exe");
      this.rcFilePath = await this.exeExtractRc(electron);
      // 去除不可见字符（保留换行符）
      // 这里的正则表达式去除了除换行符和可见字符外的所有字符
      return fs
        .readFileSync(this.rcFilePath, "utf-8")
        .replace(/[^\x20-\x7E\n]/g, "");
    });
    ipcMain.on("ipc-change-rc", async (event, rcContent) => {
      fs.writeFileSync(this.rcFilePath, rcContent, "utf-8");
      event.reply("change-rc-success");
    });
    ipcMain.on("ipc-change-exe", async (event, { iconPath }) => {
      const electron = path.join(this.electronDownloadPath, "electron.exe");
      const resourceHacker = path.normalize(
        path.resolve(assetsPath, "exe", "ResourceHacker.exe")
      );
      // 确保输出目录存在
      const outputDir = path.dirname(this.rcFilePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const ScriptPath = path.resolve(assetsPath, "downloads/ScriptFile.txt");
      const MyProg_Rus = path.resolve(assetsPath, "downloads/MyProg_Rus.log");
      const ScriptContent = `
    [FILENAMES]
    Exe=       "${electron}"
    SaveAs=    "${electron}"
    Log=       "${MyProg_Rus}"
    [COMMANDS]
    ${Boolean(iconPath) && `-addoverwrite    "${iconPath}", ICONGROUP, 1`}
    -addoverwrite    "${this.rcFilePath.replace(".rc", ".res")}", VERSIONINFO, 1
    `;
      fs.writeFileSync(ScriptPath, ScriptContent, "utf-8");
      try {
        await this.rcHandle(resourceHacker, this.rcFilePath);
        console.log("========================");
        await this.resourceHackerHandle(resourceHacker, ScriptPath);
        event.reply("change-exe-res", {
          code: 0,
          result: "success",
          // msg: "success",
          msg: fs
            .readFileSync(MyProg_Rus, "utf-8")
            .replace(/[^\x20-\x7E\n]/g, ""),
        });
      } catch (error) {
        event.reply("change-exe-res", {
          code: -1,
          result: "failure",
          msg: error.message,
        });
        logging.error(error);
      } finally {
        // 删除临时文件
        fs.unlinkSync(ScriptPath);
        fs.unlinkSync(MyProg_Rus);
        fs.unlinkSync(this.rcFilePath);
        fs.unlinkSync(this.rcFilePath.replace(".rc", ".res"));
      }
    });
    ipcMain.on(
      "ipc-digital-signature",
      async (event, { signaturePath, signaturePwd }) => {
        const electron = path.join(this.electronDownloadPath, "electron.exe");
        // `signtool` 的路径
        // const signtoolPath =
        //   "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x64\\signtool.exe";
        // 签名参数
        const signOptions = [
          "sign",
          "/f",
          signaturePath ?? "D:\\sign\\Yian Technology (Shenzhen) Co., Ltd..pfx", // 证书文件路径
          "/p",
          signaturePwd ?? "yian22()", // 证书密码
          "/t",
          "http://timestamp.digicert.com", // 时间戳 URL
          "/fd",
          "SHA256", // 哈希算法
          electron, // 需要签名的文件路径
        ];

        // 启动 `signtool` 命令
        const signProcess = spawn(this.signtoolPath, signOptions, {
          env: process.env,
        });

        // 处理 `signtool` 的输出
        signProcess.stdout.on("data", (data) => {
          logging.log(`stdout: ${data}`);
        });

        signProcess.stderr.on("data", (data) => {
          logging.error(`stderr: ${data}`);
        });

        signProcess.on("close", (code) => {
          if (code === 0) {
            logging.log("签名成功");
            event.reply("digital-signature-res", {
              code,
              result: "success",
            });
          } else {
            logging.error(`签名失败，退出码 ${code}`);
            event.reply("digital-signature-res", {
              code,
              result: "failure",
            });
          }
        });
      }
    );
    ipcMain.on("ipc-wvp-signature", (event, { accountName, password }) => {
      try {
        this.checkPythonWvp();
        const exePath = path.join(assetsPath, "exe/python/wvp.exe");

        const command = `"${exePath}" ${accountName} ${password} "${this.electronDownloadPath}"`;
        logging.log("wvp signature command:", command);
        const result = execSync(command, { encoding: "utf8" });
        logging.log("wvp signature success result:", result);
        const electronPathFn = (targetPath) =>
          path.join(this.electronDownloadPath, targetPath);
        fs.copyFileSync(
          electronPathFn("electron.exe"),
          electronPathFn("../electron.exe")
        );
        fs.copyFileSync(
          electronPathFn("electron.exe.sig"),
          electronPathFn("../electron.exe.sig")
        );

        // deleteFolderRecursive(this.electronDownloadPath);

        event.reply("wvp-signature-res", {
          code: 0,
          result: "success",
        });
      } catch (error) {
        logging.log("wvp signature failure error:", error);
        event.reply("wvp-signature-res", {
          code: -1,
          result: "failure",
        });
      }
    });
    ipcMain.on("ipc-expand-archive", async (event, targetPath) => {
      try {
        await this.expandArchive(targetPath);
        event.reply("expand-archive-res", { code: 0, result: "success" });
      } catch (error) {
        event.reply("expand-archive-res", { code: -1, result: "failure" });
      }
    });
  }
  checkProxy() {
    const { ip, port } = getProxyAddress() ?? { ip: "", port: "" };
    if (ip && port) {
      this.proxyUrl = `http://${ip}:${port}`;
    } else {
      this.proxyUrl = undefined;
    }
  }
  expandArchive = (zipPath) => {
    this.electronDownloadPath = zipPath.replace(".zip", "");
    console.log("electronDownloadPath", this.electronDownloadPath);
    return new Promise((resolve, reject) => {
      const command = `Expand-Archive -Path "${zipPath}" -DestinationPath "${this.electronDownloadPath}"`;
      const powershell = spawn("powershell.exe", ["-Command", command]);
      powershell.stdout.on("data", (data) => {
        logging.log(`stdout: ${data}`);
      });

      powershell.stderr.on("data", (data) => {
        logging.error(`stderr: ${data}`);
      });

      powershell.on("close", (code) => {
        if (code === 0) {
          logging.log(`Successfully, code ${code}`);
          resolve();
        } else {
          logging.log(`Failed, code ${code}`);
          reject(new Error(`Failed, code ${code}`));
        }
      });
    });
  };
  exeExtractRc = (
    exePath = path.join(this.electronDownloadPath, "electron.exe"),
    rcPath = path.resolve(assetsPath, "downloads/temp.rc"),
    batPath = path.join(assetsPath, "exe/ExeExtractRc.bat"),
    rhPath = path.join(assetsPath, "exe/ResourceHacker.exe")
  ) => {
    return new Promise((resolve, reject) => {
      try {
        // fs.writeFileSync(rcPath, "");
        const command = `"${batPath}" "${rhPath}" "${exePath}" "${rcPath}"`;
        logging.log(`Executing command: ${command}`);
        const result = execSync(command, { encoding: "utf8" });
        logging.log("exeExtractRc result:", result);
        logging.log("extract successfully:", fs.readFileSync(rcPath, "utf-8"));
        resolve(rcPath);
      } catch (error) {
        logging.error(`extract Failed, ${error.message}`);
        reject(new Error(`extract Failed`));
      }
    });
  };
  rcHandle = (resourceHacker, rcFilePath) => {
    return new Promise((resolve, reject) => {
      try {
        const resFilePath = rcFilePath.replace(".rc", ".res");
        const command = `"${resourceHacker}" -open "${rcFilePath}" -save "${resFilePath}" -action compile`;
        logging.log(`rcHandle command: ${command}`);
        const result = execSync(command, { encoding: "utf8" });
        logging.log("rcHandle result:", result);
        resolve();
      } catch (error) {
        logging.error(`Failed to compile RC file, ${error.message}`);
        reject(new Error(`Failed to compile RC file`));
      }

      // const rc = path.join(assetsPath, "exe/rc.exe");
      // const rcProcess = spawn(rc, [`"${rcFilePath}"`]);
      // rcProcess.stdout.on("data", (data) => {
      //   logging.log(`stdout: ${data}`);
      // });
      // rcProcess.stderr.on("data", (data) => {
      //   logging.error(`stderr: ${data}`);
      // });
      // rcProcess.on("close", (code) => {
      //   if (code === 0) {
      //     logging.log("RC file compiled successfully to RES file");
      //     resolve();
      //   } else {
      //     logging.error(`Failed to compile RC file, exit code: ${code}`);
      //     reject(new Error(`Failed to compile RC file, exit code: ${code}`));
      //   }
      // });
    });
  };
  resourceHackerHandle = (resourceHacker, ScriptPath) => {
    return new Promise((resolve, reject) => {
      try {
        const command = `"${resourceHacker}" -script "${ScriptPath}"`;
        logging.log(`resourceHackerHandle command: ${command}`);
        const result = execSync(command, { encoding: "utf8" });
        logging.log("resourceHackerHandle result:", result);
        resolve();
      } catch (error) {
        logging.error(`resourceHacker Failed error: ${error}`);
        reject(new Error(`resourceHacker Failed`));
      }
    });
  };
  checkPythonWvp = () => {
    return new Promise((resolve, reject) => {
      try {
        execSync("python --version");
        // execSync("python --version", { stdio: "ignore" });

        execSync("pip show castlabs-evs");
        logging.log("checkPythonInstalled successfully");
        resolve();
      } catch (error) {
        logging.log("checkPythonInstalled Failed");
        reject();
      }
    });
  };
}

const updateExe = new UpdateExe();

module.exports = { updateExe };
