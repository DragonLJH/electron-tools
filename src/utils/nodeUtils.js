const { execSync, spawnSync } = require("child_process");

let indate = 0;
let proxyAddress;
const stayDuration = 1000 * 5;

export const getProxyAddress = () => {
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
