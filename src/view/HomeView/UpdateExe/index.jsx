import React, { useEffect, useMemo, useState } from "react";
import DTextChange from "@src/components/DTextChange";
import DInputBox from "@src/components/DInputBox";
import { DStepCard, DStepCardItem } from "@src/components/DStepCard";
import { DProgress } from "@src/components";

import { useSynchronous } from "@src/utils/useHooks";
import { connect, useSelector } from "react-redux";
import { useLocalStorageState } from "ahooks";

import "./index.scss";
const UpdateExe = (props) => {
  const { ipcCreateWin, changeStepArray, changeConfiguration } = props;
  const stepArray = useSelector((state) => state.stepArray);
  const configuration = useSelector((state) => state.configuration);
  const [rcContent, setRcContent] = useState("");
  const [rcList, setRcList] = useState([]);
  const [stepList, setStepList] = useState(
    new Array(2).fill(undefined).map((_, index) => {
      const step = index + 1;
      return {
        step: index,
        title: `步骤${step}`,
        status: step === 1 ? "process" : "waiting",
      };
    })
  );

  const [config, setConfig] = useLocalStorageState("config", {
    defaultValue: {},
  });
  const updateStepArray = (step, index = 0) => {
    stepArray.splice(index, 1, { ...stepArray[index], ...step });
    changeStepArray([...stepArray.map((item) => item)]);
  };
  const download = () => {
    let [stepA] = stepArray;
    updateStepArray({ mask: true });
    console.log("download", stepA);
    window.ipcR.ipcGotDownload({
      url: stepA.url || stepA.defaultUrl,
      isStream: true,
      callback: async function ({ code, result, msg }) {
        alert(`download ${result}`);
        if (code === -1) {
          return;
        }
        updateStepArray({ status: result, mask: false });
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
        let [stepA] = stepArray;
        percent = Number((percent * 100).toFixed(1));
        if (percent === stepA.progress) return;
        updateStepArray({ progress: percent });
      },
      discontinueCallback: function () {
        setDiscontinue(false);
      },
    });
  };

  const changeRc = () => {
    updateStepArray({ mask: true }, 1);
    window.ipcR.ipcChangeRc(rcList.join("\n"), () => {
      alert("changeRc success");
      updateStepArray({ mask: false }, 1);
    });
  };

  const allStepFinish = async () => {
    updateStepArray({ mask: true }, 1);
    try {
      await changeExe();
      await digitalSignature();
      await ipcWvpSignature();
    } catch (error) {
      console.error("[allStepFinish]", error);
      alert("allStepFinish error", error);
    } finally {
      updateStepArray({ mask: false }, 1);
    }
  };
  const changeExe = async () => {
    return await new Promise((resolve) => {
      window.ipcR.ipcChangeExe(stepArray[1], ({ code, result, msg }) => {
        if (code !== 0) throw "changeExe error";
        resolve(`changeExe: ${result}`);
      });
    });
  };
  const digitalSignature = async () => {
    return await new Promise((resolve) => {
      const { signaturePath, signaturePwd } = configuration;
      console.log(
        "signaturePath",
        signaturePath.value,
        "signaturePwd",
        signaturePwd.value
      );
      if (!signaturePath.value) throw "signaturePath is empty";
      if (!signaturePwd.value) throw "signaturePwd is empty";
      window.ipcR.ipcDigitalSignature(configuration, (_, { code, result }) => {
        if (code !== 0) throw "digitalSignature error";
        resolve(`digitalSignature: ${result}`);
      });
    });
  };
  const ipcWvpSignature = async () => {
    return await new Promise((resolve) => {
      const { accountName, password } = configuration;
      if (!accountName.value) throw "accountName is empty";
      if (!password.value) throw "password is empty";
      window.ipcR.ipcWvpSignature(configuration, ({ code, result }) => {
        if (code !== 0) throw "ipcWvpSignature error";
        resolve(`ipcWvpSignature: ${result}`);
      });
    });
  };
  useEffect(() => {
    console.log("[UpdateExe props]", props);
  }, []);
  useEffect(() => {
    console.log("[UpdateExe configuration]", configuration);
  }, [configuration]);

  useEffect(() => {
    const list = rcContent.split("\n");
    setRcList(list);
    console.log("rcContent", list);
  }, [rcContent]);

  const initLocalStorage = () => {
    if (Object.keys(config).length) {
      Object.entries(config).forEach(([k, value]) => {
        const res = { ...configuration[k], value };
        const { callIpc } = res;
        if (!!callIpc && !!value) window.ipcR[callIpc](value);
        console.log("{k v}", { [k]: res });
        changeConfiguration({
          [k]: res,
        });
      });
    }
  };

  useEffect(() => {
    initLocalStorage();
  }, []);
  useEffect(() => {
    console.log("[configuration]", configuration);
  }, [configuration]);

  return (
    <>
      <div className="update-exe">
        <DStepCard {...{ stepList, w: 600, h: 400 }}>
          <DStepCardItem mask={stepArray[0].mask}>
            <DInputBox
              disabled
              {...{
                id: "urlText",
                value:
                  stepArray[0].url ||
                  stepArray[0].filePath ||
                  stepArray[0].defaultUrl,
              }}
            />
            <DProgress progress={stepArray[0].progress}>
              <DInputBox
                {...{
                  id: "url",
                  label: "下载链接",
                  button: "download",
                  value: stepArray[0].url || stepArray[0].defaultUrl,
                  onChange: (value) => {
                    stepArray[0].url = value;
                    changeStepArray([...stepArray.map((item) => item)]);
                  },
                  btnFn: () => download(),
                }}
              />
            </DProgress>
            <DInputBox
              {...{
                id: "filePath",
                label: "选择文件路径",
                button: "Selected",
                extensions: ["zip"],
                value: stepArray[0].filePath,
                onChange: (filePath) => {
                  console.log("[filePath]", filePath);
                  updateStepArray({ filePath, mask: true });
                  window.ipcR.ipcExpandArchive({
                    targetPath: filePath,
                    callback: async ({ code, result }) => {
                      alert(`expandArchive ${result}`);
                      setRcContent(await window.ipcR.ipcGetExeToRc());
                      setStepList((pre) => {
                        pre[0].status = "finish";
                        pre[1].status = "process";
                        return pre.map((item, index) => {
                          return { ...item };
                        });
                      });
                      updateStepArray({ mask: false });
                    },
                  });
                },
              }}
            />
          </DStepCardItem>
          <DStepCardItem mask={stepArray[1].mask}>
            <DImgBox
              imgPath={stepArray[1].iconPath}
              imgUri={stepArray[1].iconUri}
              extensions={["ico"]}
              callback={(iconPath, iconUri) => {
                updateStepArray({ iconPath, iconUri }, 1);
              }}
            />
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
              <div className="btn" onClick={allStepFinish}>
                changeExe
              </div>
            </div>
          </DStepCardItem>
        </DStepCard>
        <i
          className="setting-box"
          onClick={() => {
            ipcCreateWin({ name: "UpdateExeSetting" });
          }}
        ></i>
      </div>
    </>
  );
};

const DImgBox = (props) => {
  const { imgPath, imgUri: backgroundImage, extensions, callback } = props;
  const imgClick = async () => {
    const { canceled, filePaths } = await window.ipcR.ipcDialogOpen({
      properties: ["openFile"],
      filters: [
        {
          name: "Tracks",
          extensions,
        },
      ],
    });
    if (!canceled) {
      const [filePath] = filePaths;
      const iconBase64 = await imgBase64(filePath);
      callback(filePath, iconBase64);
    } else {
      callback();
    }
  };
  const imgBase64 = async (imgPath) => {
    const iconBase64 = await window.ipcR.ipcReadFile({
      path: imgPath,
      encoding: "base64",
    });
    return `url(data:image/jpg;base64,${iconBase64})`;
  };
  return (
    <div className="d-img-box" onClick={imgClick}>
      <div key={imgPath} className="img-item" style={{ backgroundImage }}></div>
    </div>
  );
};

export default UpdateExe;
