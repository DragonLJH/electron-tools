import React, { useEffect, useState } from "react";
import { debounce } from "@src/utils/index";
import "./index.scss";
const DTextChange = (props) => {
  const { value, callback } = props;
  const debouncedCallback = debounce(callback, 500);
  const [inputBoolean, setInputBoolean] = useState(false);
  return (
    <div
      className="d-text-change"
      onDoubleClick={() => setInputBoolean(true)}
      onMouseOut={() => setInputBoolean(false)}
    >
      {inputBoolean && (
        <div className="input-box">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              console.log(e.target.value);
              callback(e.target.value);
            }}
          />
        </div>
      )}
      {inputBoolean || <div className="value">{`${value}`}</div>}
    </div>
  );
};

export default DTextChange;
