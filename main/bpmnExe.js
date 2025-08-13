const { ipcMain, app } = require("electron");
const fs = require("fs");
const logging = require("electron-log");
const path = require("path");
const assetsPath =
    process.env.NODE_ENV === "production"
        ? path.resolve(process.resourcesPath, "assets")
        : path.join(__dirname, "../assets");
class BpmnExe {
    bpmnPath = path.join(assetsPath, "bpmn");
    constructor() { }
    init() {
        ipcMain.on('bpmn-save', (event, { id, bpmnData }) => {
            try {
                const outputPath = path.join(this.bpmnPath, `${id}.bpmn`)
                if (!fs.existsSync(this.bpmnPath)) fs.mkdirSync(this.bpmnPath, { recursive: true })
                const filePath = this.fileExistRename(path.join(outputPath, `${id}.bpmn`))
                fs.writeFile(outputPath, bpmnData, (err) => {
                    if (err) {
                        logging.error(err);
                        event.reply('bpmn-save-res', { err });
                    } else {
                        event.reply('bpmn-save-res', { id });
                    }
                })
            } catch (error) {
                event.reply('bpmn-save-res', { err });
            }

        })
    }
    fileExistRename(path, count = 1) {
        if (!path) return path
        if (!fs.existsSync(path)) return path
        let newPath = path.replace(/\.([A-Za-z0-9]+)$/, `(${count++}).$1`)
        if (!fs.existsSync(newPath)) return newPath
        return this.fileExistRename(path, count)
    }
}
const bpmnExe = new BpmnExe();

module.exports = { bpmnExe };
