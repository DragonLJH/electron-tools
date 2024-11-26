const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const [value] = args;
const defaultConfig = {
  main: "main",
  st: "signature-tools",
};
const rootPath = process.cwd();
const packageDirectory = path.resolve(__dirname, "../../package");
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
const copyFile = (src, dest) => {
  fs.createReadStream(src).pipe(fs.createWriteStream(dest));
};
const mergeFile = (f1, f2) => {
  const fileToJson = (f) => {
    try {
      return JSON.parse(fs.readFileSync(f, "utf8"));
    } catch (error) {
      console.log(`[mergeFile] ${f} is not a valid json file`);
    }
  };
  const mergeRes = mergeObj(fileToJson(f1), fileToJson(f2));
  fs.writeFileSync(f1, JSON.stringify(mergeRes, null, 2));
  console.log(`[mergeFile mergeRes]`, mergeRes);
};
if (value === "config")
  return console.log(`defaultConfig: ${Object.keys(defaultConfig)}`);
if (args.length >= 2) return console.log("Invalid arguments");
if (!args.length) {
  mergeFile(
    path.join(rootPath, "package.json"),
    path.join(packageDirectory, "main/package.json")
  );
  copyFile(
    path.join(packageDirectory, "main/.env"),
    path.join(rootPath, ".env")
  );
} else {
  if (!defaultConfig.hasOwnProperty(value))
    return console.log(`Invalid argument: ${value}`);
  mergeFile(
    path.join(rootPath, "package.json"),
    path.join(packageDirectory, `${defaultConfig[value]}/package.json`)
  );
  copyFile(
    path.join(packageDirectory, `${defaultConfig[value]}/.env`),
    path.join(rootPath, ".env")
  );
}
