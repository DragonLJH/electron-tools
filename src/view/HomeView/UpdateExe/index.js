import React, { useEffect, useState } from "react";
import DTextChange from "@src/components/DTextChange";
import "./index.scss";
const UpdateExe = () => {
  const [rcContent, setRcContent] = useState("");
  const [stepA, setStepA] = useState({
    url: "https://github.com/castlabs/electron-releases/releases/download/v11.3.0-wvvmp/electron-v11.3.0-wvvmp-win32-x64.zip",
    progress: 0,
    status: "waiting",
  });
  const [stepB, setStepB] = useState({
    brand: "Loong",
    productName: "Loong Dragon",
    date: "2024",
  });
  const [rcList, setRcList] = useState([]);
  const download = () => {
    window.ipcR.ipcGotDownload({
      url: stepA.url,
      isStream: true,
      callback: async function (data) {
        // const { percent } = data;
        // percent = Number((percent * 100).toFixed(0));
        // setStepList((pre) => {
        //   pre[0].progress = percent;
        //   return pre;
        // });
        // console.log(`progress:`, percent);
        setStepA({ ...stepA, status: data });
        console.log(`download:`, data);
        setRcContent(await window.ipcR.ipcGetExeToRc());
      },
    });
  };
  const changeExe = () => {
    window.ipcR.ipcChangeExe(stepB, (res) => {
      alert(`changeExe ${res}`);
    });
  };
  const changeRc = () => {
    window.ipcR.ipcChangeRc(rcList.join("\n"), () => {
      alert("changeRc success");
    });
  };
  const digitalSignature = () => {
    window.ipcR.ipcDigitalSignature((res) => {
      alert(`digitalSignature ${res}`);
    });
  };
  const ipcWvpSignature = () => {
    window.ipcR.ipcWvpSignature((res) => {
      alert(`ipcWvpSignature ${res}`);
    });
  };

  useEffect(() => {
    const list = rcContent.split("\n");
    setRcList(list);
    console.log("rcContent", list);
  }, [rcContent]);

  return (
    <>
      <div className="update-exe">
        <div className="step-1">
          <div className="download-box">
            <div className="step-title">
              <span>下载资源</span>
              <span>{stepA.url}</span>
            </div>
            <div className="input-box" data-label="url">
              <input
                type="text"
                value={stepA.url}
                onChange={(e) => {
                  console.log(e.target.value);
                  setStepA({ ...stepA, url: e.target.value });
                }}
              />
              <div className="btn" onClick={download}>
                download
              </div>
            </div>
            <div>{stepA.status}</div>
            {/* <div className="progress">
              <div className="progress-whole">
                <div
                  className="progress-part"
                  style={{ width: `${stepList[0].progress}%` }}
                ></div>
              </div>
              <div className="text">{stepList[0].progress}%</div>
            </div> */}
          </div>
        </div>
        <div className="step-2">
          {rcList.map((item, index) => {
            return (
              <DTextChange
                value={item}
                callback={(data) => {
                  const list = [...rcList];
                  list.splice(index, 1, data);
                  setRcList(list);
                  console.log(data);
                }}
                key={index}
              />
            );
          })}
          <div className="btn" onClick={changeRc}>
            changeRc
          </div>
          <div className="btn" onClick={changeExe}>
            changeExe
          </div>
          <div className="btn" onClick={digitalSignature}>
            digitalSignature
          </div>
          <div className="btn" onClick={ipcWvpSignature}>
          ipcWvpSignature
          </div>
        </div>
        <div className="step-3"></div>
        <div className="step-4"></div>
      </div>
    </>
  );
};

export default UpdateExe;
