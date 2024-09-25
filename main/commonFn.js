const fs = require("fs");
const nodePpath = require("path");
const { execSync, spawnSync } = require("child_process");

// 导出一个函数，用于递归删除文件夹
function deleteFolderRecursive(path) {
  // 如果路径存在
  if (fs.existsSync(path)) {
    // 读取路径下的所有文件和文件夹
    fs.readdirSync(path).forEach((file) => {
      // 获取当前路径
      const curPath = nodePpath.join(path, file);
      // 如果是文件夹
      if (fs.lstatSync(curPath).isDirectory()) {
        // 递归删除文件夹
        deleteFolderRecursive(curPath);
      } else {
        // 否则删除文件
        try {
          fs.unlinkSync(curPath);
        } catch (error) {
          // 如果删除文件失败，打印错误信息
          console.error(`无法删除文件 ${curPath}: ${error.message}`);
        }
      }
    });
    // 删除文件夹
    try {
      fs.rmdirSync(path);
    } catch (error) {
      // 如果删除文件夹失败，打印错误信息
      console.error(`无法删除文件夹 ${path}: ${error.message}`);
    }
  }
}

let indate = 0;
let proxyAddress;
const stayDuration = 1000 * 5;

const getProxyAddress = () => {
  if (proxyAddress && indate > Date.now()) {
    return proxyAddress;
  }

  try {
    let proxy = [];
    let proxyEnable;
    let proxySetting = execSync(
      'chcp 65001 | reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" '
    ).toString("utf8");
    if (proxySetting) {
      proxy = proxySetting
        .match(/ProxyServer(.*)/)[0]
        .match(/(.[^ ]*)$/)[0]
        .trim()
        .toString()
        .split(":");
      let enable =
        proxySetting.match(/HTTPEnable(.*)/) > 0
          ? proxySetting.match(/HTTPEnable(.*)/)
          : proxySetting.match(/ProxyEnable(.*)/);
      proxyEnable = parseInt(enable[0].match(/(.[^ ]*)$/)[0].trim());
    }

    const address = {
      ip: proxy[0] || "",
      port: proxy[1] || "",
    };

    if (proxyEnable > 0 && address.ip && address.port) {
      proxyAddress = address;
      indate = Date.now() + stayDuration;
      return address;
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
};

module.exports = {
  deleteFolderRecursive,
  getProxyAddress,
};
