import React, { useState } from "react";
import { HashRouter as Router, Route, Redirect } from "react-router-dom";

// 动态加载view根目录下的路由组件
const requireViewRoutes = require.context("../view", true, /index.(jsx|js)$/);
// 动态加载view根目录下的page.js信息
const requireViewPages = require.context("../view", true, /page.(jsx|js)$/);
export const viewRoutes = requireViewRoutes
  .keys()
  .map((item) => {
    const pageMate = requireViewPages(
      item.replace("index.js", "page.js")
    ).default;
    const { isCreate, isMenu } = pageMate.winOp;
    let name = item.replace(/^\.\//, "").replace(/\/index.(jsx|js)$/, "");
    if (isCreate && name.indexOf("/") > -1) {
      name = name.split("/");
      name = name[name.length - 1];
    }
    console.log({
      name,
      component: requireViewRoutes(item).default,
      path: `/${name}`,
      mate: pageMate,
    });
    console.log("----------");
    return {
      name,
      component: requireViewRoutes(item).default,
      path: `/${name}`,
      mate: pageMate,
      isMenu,
    };
  })
  .filter((item) => item.name.indexOf("/") == -1);

// 动态加载HomeView目录下的路由组件
const requireHomeViewRoutes = require.context(
  "../view/HomeView",
  true,
  /index.(jsx|js)$/
);

// 动态加载view根目录下的page.js信息
const requireHomeViewPages = require.context(
  "../view/HomeView",
  true,
  /page.(jsx|js)$/
);

export const homeViewRoutes = requireHomeViewRoutes
  .keys()
  .map((item) => {
    const pageMate = requireHomeViewPages(
      item.replace("index.js", "page.js")
    ).default;
    const name = item.replace(/^\.\//, "").replace(/\/?index.(jsx|js)$/, "");
    return {
      name,
      component: requireHomeViewRoutes(item).default,
      path: `/${name}`,
      mate: pageMate,
    };
  })
  .filter((item) => item.name)
  .map(({ name, component, path, mate }) => {
    return { name, component, path: `/HomeView${path}`, mate };
  });

// 动态添加路由
const DynamicRoute = ({ path, component }) => {
  return <Route path={path} component={component} />;
};

// 首页路由组件
export const HomeViewComponent = () => {
  const [routes, setRoutes] = useState(homeViewRoutes);
  return (
    <>
      <Router>
        {/* 路由配置 */}
        {routes.map((route, index) => {
          return (
            <DynamicRoute
              key={index}
              path={route.path}
              component={route.component}
            />
          );
        })}
      </Router>
    </>
  );
};

// 根路由组件
const MyComponent = (props) => {
  const { children } = props;
  const [routes, setRoutes] = useState(viewRoutes);

  const addRoute = () => {
    const newRoute = {
      path: "/dynamic",
      component: () => <div>Dynamic Route</div>,
    };
    setRoutes([...routes, newRoute]);
  };

  return (
    <>
      <Router>
        {children}
        <div className="app-main">
          {/* 重定向登录页 */}
          <Route exact path="/">
            <Redirect to="/HomeView/UpdateExe" />
          </Route>
          {/* 路由配置 */}
          {routes.map((route, index) => {
            return (
              <DynamicRoute
                key={index}
                path={route.path}
                component={route.component}
              />
            );
          })}
        </div>
      </Router>
    </>
  );
};

export default MyComponent;
