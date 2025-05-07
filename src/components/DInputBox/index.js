import "./index.scss";
import React, { useEffect, useRef, useState } from "react";

const DInputBox = (props) => {
  const { children } = props;
  const { label, value, onChange } = props;
  const { flex, disabled, extensions, button, btnFn } = props;
  const inputRef = useRef(null);
  const flexAttr = flex ?? { "data-flex": "" };
  const buttonAttr = button && { "data-button": "" };
  const disabledAttr = (flag) =>
    ((!btnFn && button) || disabled) &&
    [{ disabled: true }, { "data-disabled": "" }][flag];

  const btnClick = async () => {
    let { canceled, filePaths } = await window.ipcR.ipcDialogOpen({
      properties: ["openFile", ...[extensions ?? "openDirectory"]],
      filters: [
        {
          name: "Tracks",
          extensions,
        },
      ],
    });
    if (!canceled) {
      onChange(filePaths.join(","));
    }
  };

  useEffect(() => {
    console.log("DInputBox props:", props);
  }, []);
  // useEffect(() => {
  //   if (inputRef.current && !(button || disabled)) inputRef.current.focus();
  // }, [inputRef.current]);
  return (
    <div className="d-input-box" {...buttonAttr}>
      <div className="d-item" {...flexAttr} {...disabledAttr(1)}>
        {Boolean(label) && (
          <div className="label" title={label}>
            {label}
          </div>
        )}
        {children}
        {!Boolean(children) && (
          <input
            ref={inputRef}
            onChange={(e) => onChange(e.target.value)}
            className="input"
            type="text"
            {...disabledAttr(0)}
            value={value}
          />
        )}
      </div>
      <div className="d-button" onClick={btnFn ?? btnClick}>
        {button ?? "button"}
      </div>
    </div>
  );
};
export default DInputBox;
