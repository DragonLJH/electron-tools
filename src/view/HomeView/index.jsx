import "./index.scss";
import React, { useState, useEffect } from "react";
import {
  homeViewRoutes,
  HomeViewComponent,
  IS_SHOW_MENU,
} from "@src/route/index";
import { useHistory, useLocation, useParams } from "react-router-dom";
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

const HomeView = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const params = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const [routes, setRoutes] = useState(null);
  console.log(history, pathname, params);
  console.log("HomeView", routes);
  const menuClick = (data) => {
    let winKey = Math.random().toString().slice(2);
    let { key, label, mate } = data;
    const { winOp } = mate;
    const { isCreate } = winOp;
    if (isCreate) {
      key = key.split("/");
      key = key[key.length - 1];
    } else {
      history.push(key);
    }
    window.ipcR.ipcCreatewin({
      winKey,
      routeOp: winOp,
      routeName: label,
      routePath: `${key}?winKey=${winKey}`,
    });
    console.log("menuClick", winKey, key, label, mate);
  };
  useEffect(() => {
    setRoutes(
      homeViewRoutes.map(({ name, path, mate }) => {
        return getItem(name, path, mate);
      })
    );
  }, []);
  return (
    <>
      <div className="home-view">
        <div className="home-view-left">
          {(process.env.BUILD_MEMU ?? "true") === "true" &&
            IS_SHOW_MENU &&
            routes && <DMenu items={routes} onClick={menuClick} />}
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
