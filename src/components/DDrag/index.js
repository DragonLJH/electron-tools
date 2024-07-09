import "./index.scss";
import React, { useEffect, useRef, useState } from "react";

const DDrag = (props) => {
  const { styleProps, dragstartCallback, dropCallback, children } = props;
  useEffect(() => {
    let drop = document.querySelector(".d-drag");
    drop?.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    drop?.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropCallback && dropCallback(event);
    });
  }, []);
  useEffect(() => {
    const dragArr = document.querySelectorAll(".d-drag > div");
    Array.from(dragArr).forEach((item) => {
      if (item.getAttribute("draggable") === "true") return;
      item.setAttribute("draggable", "true");
      item.addEventListener("dragstart", (event) => {
        event.stopPropagation();
        dragstartCallback && dragstartCallback(event);
      });
    });
  });
  return (
    <div className={`d-drag`} style={styleProps ?? {}}>
      {children}
    </div>
  );
};
export default DDrag;
