import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import "./index.css";
import { useHistory, useLocation } from "react-router-dom";
import { viewRoutes } from "@src/route/index";
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}
const AppTop = () => {
  const l = useLocation();
  const h = useHistory();
  let query = useQuery();
  const operate = useRef(null);
  const [winKey, setWinKey] = useState("Home");
  const [operateCount, setOperateCount] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [url, setUrl] = useState("");
  const [moreButton, setMoreButton] = useState(false);
  const setIsMaximizedFn = async () => {
    let is = await window.ipcR.ipcIsMaximized(winKey);
    setIsMaximized(!is);
  };
  const openWin = (item) => {
    let winKey = Math.random().toString().slice(2);
    let { name, path, mate } = item;
    const { winOp } = mate;
    window.ipcR.ipcCreatewin({
      winKey,
      routeOp: winOp,
      routeName: name,
      routePath: `${path}?winKey=${winKey}`,
    });
  };
  const hasParent = useMemo(() => {
    for (let [key, value] of query.entries()) {
      if (key === "winKey") {
        return window.ipcR.ipcGetParentWindow(value);
      }
    }
    return false;
  }, []);
  useEffect(() => {
    console.log("hasParent", hasParent);
    if (l.search) setWinKey(l.search.replace("?", "").split("=")[1]);
  }, []);
  useEffect(() => {
    setUrl(location.href);
  }, [winKey]);
  useEffect(() => {
    let childElementCount = operate?.current?.childElementCount;
    if (childElementCount) setOperateCount(childElementCount);
  }, [operate.current]);
  return (
    <>
      <div className="app-top">
        <div className="app-top-title">
          <div className="text">ElectronTitle</div>
          <div className="region-drag"></div>
          <div
            className="operate"
            ref={operate}
            style={{
              "--w": `${operateCount * 50 + (operateCount - 1) * 10}px`,
            }}
          >
            {!hasParent && (
              <div className="more-button">
                <span onClick={() => setMoreButton(true)}></span>
                {moreButton && (
                  <div
                    className="more-button-items"
                    onMouseLeave={() => setMoreButton(false)}
                  >
                    {viewRoutes
                      .filter((item) => item.isMenu)
                      .map((item, index) => {
                        return (
                          <div
                            className="more-button-items-item"
                            key={index}
                            onClick={() => openWin(item)}
                          >
                            {item.mate.label}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            <div className="min">
              <span onClick={() => window.ipcR.ipcMinimize(winKey)}></span>
            </div>
            <div className={`${isMaximized ? "max" : "max2"}`}>
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setIsMaximizedFn();
                  isMaximized
                    ? window.ipcR.ipcUnmaximize(winKey)
                    : window.ipcR.ipcMaximize(winKey);
                }}
              ></span>
            </div>
            <div className="close">
              <span onClick={() => window.ipcR.ipcClose(winKey)}></span>
            </div>
          </div>
        </div>
        <div className="app-top-main">
          <div className="app-top-main-history">
            <div className="home" onClick={() => h.push("/")}></div>
            <div className="left" onClick={() => h.goBack()}></div>
            <div className="right" onClick={() => h.goForward()}></div>
            <div
              className="refresh"
              onClick={() => window.ipcR.ipcReload(winKey)}
            ></div>
          </div>
          <div className="app-top-main-url">
            <input type="text" value={url} disabled />
          </div>
        </div>
      </div>
    </>
  );
};

export default AppTop;
