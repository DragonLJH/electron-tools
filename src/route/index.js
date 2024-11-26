import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { HashRouter as Router, Route, Redirect } from "react-router-dom";
import { useSynchronous } from "@src/utils/useHooks";

export const IS_SHOW_MENU = true;

const buildFilter = (item) => {
  let name = item.replace(/^\.\//, "").replace(/\/index.(jsx|js)$/, "");
  return (
    // process.env.NODE_ENV === "development" ||
    process.env.BUILD_VIEWS ? process.env.BUILD_VIEWS.includes(name) : true
  );
};

// 动态加载view根目录下的路由组件
const requireViewRoutes = require.context("../view", true, /index.(jsx|js)$/);
// 动态加载view根目录下的page.js信息
const requireViewPages = require.context("../view", true, /page.(jsx|js)$/);
export const viewRoutes = requireViewRoutes
  .keys()
  .filter(buildFilter)
  .map((item) => {
    console.log("[viewRoutes]", item);
    const [reg] = item.match(/index\.(jsx|js)$/);
    const pageMate = requireViewPages(item.replace(reg, "page.js")).default;
    // isCreate 是否创建窗口
    // isMenu 是否显示菜单
    // redirectPath 重定向路径
    const { isCreate, isMenu, redirectPath } = pageMate.winOp;
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
      redirectPath,
    };
  })
  .filter((item) => item.name.indexOf("/") == -1);

// 动态加载HomeView目录下的路由组件
const requireHomeViewRoutes = require.context(
  "../view/HomeView",
  true,
  /index.(jsx|js)$/
);

// 动态加载HomeView根目录下的page.js信息
const requireHomeViewPages = require.context(
  "../view/HomeView",
  true,
  /page.(jsx|js)$/
);

export const homeViewRoutes = requireHomeViewRoutes
  .keys()
  .filter(buildFilter)
  .map((item) => {
    const [reg] = item.match(/index\.(jsx|js)$/);
    const pageMate = requireHomeViewPages(item.replace(reg, "page.js")).default;
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
const MainRouter = (props) => {
  const { children, init } = props;
  const routes = useSelector((state) => state.routes);
  // const [routes, setRoutes] = useState(viewRoutes);
  useEffect(() => {
    init(viewRoutes);
  });

  return (
    <>
      <Router>
        {children}
        <div className="app-main">
          {Boolean(routes) && (
            <>
              {/* 重定向登录页 */}
              <Route exact path="/">
                <Redirect to="/HomeView" />
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
              {routes
                .filter(({ redirectPath }) => redirectPath)
                .map(({ path, redirectPath }, index) => {
                  return (
                    <Route key={`redirect-${path}`} exact path={path}>
                      <Redirect to={`${path}${redirectPath}`} />
                    </Route>
                  );
                })}
            </>
          )}
        </div>
      </Router>
    </>
  );
};

// 映射 dispatch 到组件的 props
const mapDispatchToProps = useSynchronous((dispatch) => ({
  init: (data) => dispatch({ type: "ROUTE_INIT_ACTION", data }),
}));

export default connect(null, mapDispatchToProps)(MainRouter);
