import React, { useEffect, useState, useRef } from "react";
import { debounce } from "./index";
import { useLocation } from "react-router-dom";

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
      if (["ROUTE_INIT_ACTION", "HOME_ROUTE_INIT_ACTION"].includes(type)) {
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



export const useUnmount = (fn, deps) => {
  const fnRef = useRef(fn);
  // 更新 fnRef 为最新的函数（捕获最新 deps）
  fnRef.current = fn;
  useEffect(() => {
    return () => {
      fnRef.current(); // ✅ 卸载时执行最新的 fn
    };
  }, []);
}

export function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}