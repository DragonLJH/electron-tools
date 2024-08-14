import React, { useEffect, useState } from "react";
import DTextChange from "@src/components/DTextChange";
import { DStepCard, DStepCardItem } from "@src/components/DStepCard";

import "./index.scss";
const UpdateExe = () => {
  const [rcContent, setRcContent] = useState("");
  const [stepA, setStepA] = useState({
    url: "https://github.com/castlabs/electron-releases/releases/download/v11.3.0-wvvmp/electron-v11.3.0-wvvmp-win32-x64.zip",
    progress: 0,
    status: "waiting",
  });
  const [stepB, setStepB] = useState({});
  const [stepC, setStepC] = useState({
    signaturePath: "",
    signaturePwd: "yian22()",
  });
  const [stepD, setStepD] = useState({
    accountName: "loongjh",
    password: "Long1234.",
  });
  const [rcList, setRcList] = useState([]);
  const [stepList, setStepList] = useState(
    new Array(4).fill(undefined).map((_, index) => {
      const step = index + 1;
      return {
        step: index,
        title: `步骤${step}`,
        status: step === 1 ? "process" : "waiting",
      };
    })
  );
  const download = () => {
    window.ipcR.ipcGotDownload({
      url: stepA.url,
      isStream: true,
      callback: async function (data) {
        setStepA((pre) => {
          return { ...pre, status: data };
        });
        setRcContent(await window.ipcR.ipcGetExeToRc());
        setStepList((pre) => {
          pre[0].status = "finish";
          pre[1].status = "process";
          return pre.map((item, index) => {
            return { ...item };
          });
        });
      },
      progressCallback: async function (percent) {
        percent = Number((percent * 100).toFixed(1));
        setStepA((pre) => {
          return { ...pre, progress: percent };
        });
      },
    });
  };
  const changeExe = () => {
    window.ipcR.ipcChangeExe(stepB, ({ code, result, msg }) => {
      alert(`changeExe ${msg}`);
      if (code === -1) return;
      setStepList((pre) => {
        pre[1].status = "finish";
        pre[2].status = "process";
        return pre.map((item, index) => {
          return { ...item };
        });
      });
    });
  };
  const changeRc = () => {
    window.ipcR.ipcChangeRc(rcList.join("\n"), () => {
      alert("changeRc success");
    });
  };
  const digitalSignature = () => {
    window.ipcR.ipcDigitalSignature(stepC, ({ code, result }) => {
      if (code === 0) {
        setStepList((pre) => {
          pre[2].status = "finish";
          pre[3].status = "process";
          return pre.map((item, index) => {
            return { ...item };
          });
        });
      }
      alert(`digitalSignature: ${result}`);
    });
  };
  const ipcWvpSignature = () => {
    window.ipcR.ipcWvpSignature(stepD, ({ code, result }) => {
      if (code === 0) {
        setStepList((pre) => {
          pre[3].status = "finish";
          return pre.map((item, index) => {
            return { ...item };
          });
        });
      }
      alert(`ipcWvpSignature ${result}`);
    });
  };

  const changeStepB = async () => {
    let icoMsg = await window.ipcR.ipcDialogOpen({
      properties: ["openFile"],
      filters: [
        {
          name: "Tracks",
          extensions: ["ico"],
        },
      ],
    });
    if (!icoMsg.canceled) {
      const iconPath = icoMsg.filePaths[0];
      const iconBase64 = await window.ipcR.ipcReadFile({
        path: iconPath,
        encoding: "base64",
      });
      const iconUri = `data:image/jpg;base64,${iconBase64}`;
      console.log({ iconUri });
      setStepB({ ...stepB, iconPath, iconUri });
    }
  };
  const changeStepC = async () => {
    let signatureMsg = await window.ipcR.ipcDialogOpen({
      properties: ["openFile"],
      filters: [
        {
          name: "Tracks",
          extensions: ["pfx"],
        },
      ],
    });
    if (!signatureMsg.canceled) {
      const signaturePath = signatureMsg.filePaths[0];
      setStepC({ ...stepC, signaturePath });
    }
  };

  useEffect(() => {
    const list = rcContent.split("\n");
    setRcList(list);
    console.log("rcContent", list);
  }, [rcContent]);

  return (
    <>
      <div className="update-exe">
        <DStepCard {...{ stepList, w: 600, h: 400 }}>
          <DStepCardItem>
            <div className="download-box">
              <div className="box-title">
                <span>下载资源</span>
                <span>{stepA.url}</span>
              </div>
              <div
                className="input-box"
                style={{ width: "100%" }}
                data-label="url: "
              >
                <input
                  type="text"
                  value={stepA.url}
                  onChange={(e) => {
                    console.log(stepA, e.target.value);
                    setStepA({ ...stepA, url: e.target.value });
                  }}
                />
                <div className="btn" onClick={download}>
                  download
                </div>
              </div>
              <div className="progress">
                <div className="progress-whole">
                  <div
                    className="progress-part"
                    style={{ width: `${stepA.progress}%` }}
                  ></div>
                </div>
                <div className="text">{stepA.progress}%</div>
              </div>
            </div>
          </DStepCardItem>
          <DStepCardItem>
            <div className="img-box" onClick={changeStepB}>
              {stepB.iconUri && (
                <div
                  className="img-item"
                  style={{
                    backgroundImage: `url(${stepB.iconUri})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "100px",
                    height: "100px",
                  }}
                ></div>
              )}
            </div>
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
            <div className="flex-center" style={{ gap: "30px" }}>
              <div className="btn" onClick={changeRc}>
                changeRc
              </div>
              <div className="btn" onClick={changeExe}>
                changeExe
              </div>
            </div>
          </DStepCardItem>
          <DStepCardItem>
            <div className="img-box" onClick={changeStepC}>
              {stepC.signaturePath}
            </div>

            <div
              className="input-box"
              style={{ width: "100%" }}
              data-label="pwd: "
            >
              <DTextChange
                value={stepC.signaturePwd}
                callback={(data) => {
                  setStepC({ ...stepC, signaturePwd: data });
                }}
              />
            </div>

            <div className="flex-center" style={{ gap: "30px" }}>
              <div className="btn" onClick={digitalSignature}>
                digitalSignature
              </div>
            </div>
          </DStepCardItem>
          <DStepCardItem>
            <div
              className="input-box"
              style={{ width: "100%" }}
              data-label="accountName: "
            >
              <DTextChange
                value={stepD.accountName}
                callback={(data) => {
                  setStepD({ ...stepD, accountName: data });
                }}
              />
            </div>
            <div
              className="input-box"
              style={{ width: "100%" }}
              data-label="password: "
            >
              <DTextChange
                value={stepD.password}
                callback={(data) => {
                  setStepD({ ...stepD, password: data });
                }}
              />
            </div>
            <div className="flex-center" style={{ gap: "30px" }}>
              <div className="btn" onClick={ipcWvpSignature}>
                ipcWvpSignature
              </div>
            </div>
          </DStepCardItem>
        </DStepCard>
      </div>
    </>
  );
};

export default UpdateExe;
