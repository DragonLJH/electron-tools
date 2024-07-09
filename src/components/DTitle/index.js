import "./index.scss";
import React, { useEffect, useRef, useState } from "react";

const DTitle = (props) => {
  const { children, isActive, title, x, y } = props;
  const tRef = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(tRef.current.offsetWidth);
    console.log("DTitle", tRef.current.offsetWidth);
  }, [tRef.current]);
  return (
    <div className={`d-title ${isActive ? "active" : ""}`} ref={tRef}>
      {children}
      {title && (
        <div className="d-title-hover" style={{ top: y, left: x + w / 2 }}>
          {title}
        </div>
      )}
    </div>
  );
};
export default DTitle;
