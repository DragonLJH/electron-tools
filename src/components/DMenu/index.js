import "./index.scss";
import React, { useEffect, useState } from "react";
import DTitle from "@src/components/DTitle/index";
import { useLocation } from "react-router-dom";

const DMenu = (props) => {
  const { pathname } = useLocation();
  const { items, onClick, mode } = props;
  const [i, setI] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const [titleXY, setTitleXY] = useState({ x: 0, y: 0 });
  const MAX_WIDTH = 200,
    MIN_WIDTH = 50;
  const itemClick = (index, item) => {
    onClick(item);
    setI(index);
  };
  const mouseEnter = (e) => {
    if (!isActive) return;
    const { currentTarget, clientX, clientY } = e;
    console.log("mouseEnter", e, clientX, clientY);
    setTitleXY({ x: clientX, y: clientY });
  };
  useEffect(() => {});
  return (
    <div
      className="d-menu"
      style={{ width: `${mode && isActive ? MIN_WIDTH : MAX_WIDTH}px` }}
    >
      {mode && (
        <div
          className={`d-menu-top ${isActive ? "active" : ""}`}
          onClick={() => {
            setIsActive(!isActive);
          }}
        ></div>
      )}
      {items &&
        items.map((item, index) => {
          return (
            <div
              key={item.key}
              className={`d-menu-item ${pathname == item.key ? "active" : ""}`}
              onClick={() => itemClick(index, item)}
            >
              <DTitle title={`${item.label}`} {...{ ...titleXY, isActive }}>
                <div
                  className="d-menu-item-icon"
                  onMouseEnter={(e) => mouseEnter(e)}
                >
                  {item.label.slice(0, 1)}
                </div>
              </DTitle>
              {isActive || (
                <div className="d-menu-item-label" title={item.label}>
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
export default DMenu;
