import React, { useEffect, useState, useContext, useRef, useMemo, useCallback } from "react";
import "./index.css";
import { useHistory, useLocation } from "react-router-dom";
import { viewRoutes } from "@src/route/index";
import { useSynchronous, useQuery } from '@src/utils/useHooks'
import { connect } from "react-redux";

const AppTop = (props) => {
  const { ipcCreateWin, changeHasParentState } = props;
  const l = useLocation();
  const h = useHistory();
  let query = useQuery();
  const operate = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [moreButton, setMoreButton] = useState(false);

  const operateCount = useMemo(() => {
    console.log('[operateCount]', operate.current, [operate.current], operate.current?.childElementCount)
    return operate.current?.childElementCount || 0
  }, [operate.current, hasParent])

  const setIsMaximizedFn = async () => {
    let is = await window.ipcR.ipcIsMaximized(winKey);
    setIsMaximized(!is);
  };
  const [hasParent, _setHasParent] = useState(false)
  const getHasParent = useCallback(async () => {
    for (let [key, value] of query.entries()) {
      if (key === "winKey") {
        let res = await window.ipcR.ipcGetParentWindow(value);
        _setHasParent(res)
        changeHasParentState(res)
        return res
      }
    }
  }, [query])
  const url = useMemo(() => h.location.pathname ?? '', [h.location])
  const winKey = useMemo(() => {
    if (l.search) return l.search.replace("?", "").split("=")[1]
    return 'Home'
  }, [l.search])
  useEffect(() => {
    getHasParent()
  }, []);
  return (
    <>
      <div className="app-top" style={{ '--h': `${hasParent ? 50 : 100}px` }}>
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
                        const { name } = item
                        return (
                          <div
                            className="more-button-items-item"
                            key={index}
                            onClick={() => ipcCreateWin({ name })}
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
        {!hasParent && (<div className="app-top-main">
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
        </div>)}
      </div>
    </>
  );
};

// 映射 dispatch 到组件的 props
const mapDispatchToProps = useSynchronous((dispatch) => ({
  ipcCreateWin: (data) => dispatch({ type: 'IPC_CREATE_WIN', data }),
  changeHasParentState: (data) => dispatch({ type: 'IPC_CHANGE_HAS_PARENT', data }),
}), ['IPC_CHANGE_HAS_PARENT']);

export default connect(null, mapDispatchToProps)(AppTop); 
