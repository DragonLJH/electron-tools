import "./index.scss";
import React, { useEffect, useRef, useState } from "react";

export const DProgress = (props) => {
  const { progress, children } = props;
  return (
    <div className="d-progress-box">
      {children}
      <div className="d-progress">
        <div className="whole">
          <div className="part" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="text">{progress}%</div>
      </div>
    </div>
  );
};
export default DProgress;
