import React, { useEffect, useState } from "react";
import { debounce } from "./index";

export const useMouseCoordinates = () => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const coordinatesFd = debounce((x, y) => {
      setCoordinates({ x, y });
    }, 50);
    document.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      coordinatesFd(clientX, clientY);
    });
  }, []);
  return { ...coordinates };
};

// 自定义 Hook，用于同步调度功能
export const useSynchronous = (fn) => {
  return (dispatch) => {
    // 自定义的调度函数
    const customDispatch = (action) => {
      let { type, data } = action;
      // 处理特定类型的动作
      if (type === "ROUTE_INIT_ACTION") {
        data = data.map(({ component, ...item }) => item);
      }
      console.log("[window.ipcR]", window.ipcR);
      // 分发动作到 IPC
      window.ipcR.dispatchAction({ type, data });
      return dispatch(action);
    };
    return fn(customDispatch);
  };
};
