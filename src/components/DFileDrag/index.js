import "./index.scss";
import React, { useEffect, useRef, useState } from "react";

const DFileDrag = (props) => {
  const tRef = useRef(null);
  useEffect(() => {
    // 全局文件拖拽实现
    let drop = document.querySelector(".d-file-drag");
    drop?.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    drop?.addEventListener("dragenter", (event) => {
      event.preventDefault();
    });
    drop?.addEventListener("drop", (event) => {
      event.preventDefault();
      // @ts-ignore
      const files = event.dataTransfer.files;
      console.log("drop", files);
    });
    console.log("drop", drop);
  }, []);
  const change = (e) => {
    console.log("change", { ...e });
  };
  const ipcDialogOpen = async () => {
    let fMsg = await window.ipcR.ipcDialogOpen({
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Tracks",
          extensions: ["mp3", "m4a", "flac", "aiff", "wav"],
        },
      ],
    });
    if (!fMsg.canceled) {
      console.log("d-file-drag", fMsg);
      fMsg.filePaths.forEach((path) => {
        console.log("d-file-drag", path, window.ipcR.ipcReadFile({ path }));
      });
    }
  };
  return (
    <div className={`d-file-drag`} onClick={ipcDialogOpen}>
      {/* <input type="file" accept="audio/*" title="" onChange={change} /> */}
    </div>
  );
};
export default DFileDrag;
