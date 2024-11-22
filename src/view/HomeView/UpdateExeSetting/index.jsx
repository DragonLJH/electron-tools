import "./index.scss";
import React, { useEffect, useRef, useState } from "react";
import { connect, useSelector } from "react-redux";
import DInputBox from "@src/components/DInputBox";
import { useSynchronous } from "@src/utils/useHooks";

const UpdateExeSetting = (props) => {
  const { changeConfiguration } = props;
  const { configuration } = useSelector((state) => state);
  return (
    <div className="update-exe-setting">
      <div className="header">
        {Object.entries(configuration).map(([id, attr]) => {
          return (
            <DInputBox
              key={id}
              {...attr}
              onChange={(value) => {
                changeConfiguration({
                  ...configuration,
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

// 映射 dispatch 到组件的 props
const mapDispatchToProps = useSynchronous((dispatch) => ({
  changeConfiguration: (data) =>
    dispatch({ type: "CHANGE_CONFIGURATION", data }),
}));

export default connect(null, mapDispatchToProps)(UpdateExeSetting);
