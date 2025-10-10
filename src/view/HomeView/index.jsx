import "./index.scss";
import React, { useState, useEffect, useMemo } from "react";
import {
  homeViewRoutes,
  HomeViewComponent,
  IS_SHOW_MENU,
} from "@src/route/index";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DMenu from "@src/components/DMenu/index";
import { mergeObj } from "@src/utils/index";
function getItem(label, key, mate, children, icon, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
    mate,
  };
}

const HomeView = (props) => {
  const { ipcCreateWin } = props;
  const routes = useSelector((state) => state.homeViewRoutes);
  const history = useHistory();
  const { pathname } = useLocation();
  const params = useParams();
  const [collapsed, setCollapsed] = useState(false);
  // const routes = useSelector((state) => state.routes);
  const menuClick = (data) => {
    let { key, label, mate } = data;
    const { winOp } = mate;
    const { isCreate } = winOp;
    if (isCreate) return ipcCreateWin({ name: label });
    history.push(key);
  };
  useEffect(() => {
    console.log("[HomeView]routes", routes);
  }, []);
  const _routes = useMemo(() => {
    return routes
      .map(({ name, path, mate }) => {
        return getItem(name, path, mate);
      })
      .filter(({ mate }) => mate.winOp?.isHomeMenu ?? true)
      .map((data, index) => {
        const { label } = data;
        return (
          <div key={index} onClick={() => menuClick(data)}>
            {label}
          </div>
        );
      });
  }, [routes]);
  return (
    <>
      <div className="home-view">
        <div className="home-view-left">
          {(process.env.BUILD_MEMU ?? "true") === "true" &&
            IS_SHOW_MENU &&
            routes &&
            _routes}
          {/* {routes && (
            <Menu
              defaultSelectedKeys={pathname}
              mode="inline"
              onClick={menuClick}
              style={{
                width: 200,
              }}
              items={routes}
              inlineCollapsed={collapsed}
            />
          )} */}
        </div>
        <div className="home-view-main">
          <HomeViewComponent />
        </div>
      </div>
    </>
  );
};

export default HomeView;
