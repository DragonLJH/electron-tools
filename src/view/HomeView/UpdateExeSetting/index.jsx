import "./index.scss";
import React, { useEffect, useRef, useState } from "react";
import { connect, useSelector } from "react-redux";
import DInputBox from "@src/components/DInputBox";
import { useSynchronous } from "@src/utils/useHooks";
import { useLocalStorageState } from "ahooks";

const UpdateExeSetting = (props) => {
  const { changeConfiguration } = props;
  const { configuration } = useSelector((state) => state);

  const [config, setConfig] = useLocalStorageState("config", {
    defaultValue: {},
  });

  useEffect(() => {
    console.log("props", props);
  });
  return (
    <div className="update-exe-setting">
      <div className="header">
        {Object.entries(configuration).map(([id, attr]) => {
          return (
            <DInputBox
              key={id}
              {...attr}
              onChange={(value) => {
                setConfig((prev) => ({ ...prev, [id]: value }));
                changeConfiguration({
                  [id]: { ...attr, value },
                });
              }}
            />
          );
        })}
      </div>
      <div></div>
    </div>
  );
};

export default UpdateExeSetting;
