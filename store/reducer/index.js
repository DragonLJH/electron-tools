const initialState = {
  // common
  stepArray: [
    {
      url: "",
      filePath: "",
      defaultUrl:
        "https://github.com/castlabs/electron-releases/releases/download/v11.3.0-wvvmp/electron-v11.3.0-wvvmp-win32-x64.zip",
      progress: 0,
      mask: false,
    },
    { iconPath: "", iconUri: "", mask: false },
  ],
  configuration: [
    {
      id: "signaturePath",
      label: "签名文件路径",
      button: "Selected",
      extensions: ["pfx"],
      value: "",
    },
    {
      id: "signaturePwd",
      label: "签名文件密码",
      value: "yian22()",
    },
    {
      id: "accountName",
      label: "wvp账号",
      value: "loongjh",
    },
    {
      id: "password",
      label: "wvp密码",
      value: "Long1234",
    },
  ].reduce((acc, { id, ...cur }) => {
    acc[id] = { ...cur };
    return acc;
  }, {}),
  // route
  routes: [],
};
const actionsFn = {
  CHANGE_CONFIGURATION(data, state) {
    return { configuration: { ...data } };
  },
  CHANGE_STEP_ARRAY(data, state) {
    return { stepArray: data };
  },

  // 定义一个初始化路由的action，接收一个data参数，返回一个包含routes属性的对象
  ROUTE_INIT_ACTION(data) {
    return { routes: data };
  },

  // 定义一个添加路由的action，接收一个data参数和一个state参数，返回一个包含routes属性的对象
  ROUTE_ADD_ACTION(data, state) {
    return { routes: [...state.routes, ...data] };
  },
  IPC_CREATE_WIN({ name: cName }, state) {
    const { routes } = state;
    const item = routes.find((item) => item.name == cName);
    let winKey = Math.random().toString().slice(2);
    let { name, path, mate } = item;
    const { winOp } = mate;
    if (typeof window !== "undefined" && window.ipcR) {
      window.ipcR.ipcCreatewin({
        winKey,
        routeOp: winOp,
        routeName: name,
        routePath: `${path}?winKey=${winKey}`,
      });
    }
  },
  // IPC_UPDATE_STATE(data, state) {
  //   if (typeof window !== "undefined") {
  //     return { ...data };
  //   }
  //   return {};
  // },
}; // 定义一个根 reducer 函数，用于处理所有 action
const rootReducer = (state, action) => {
  // 调用 actionsFn 中对应的 action 函数，并传入 state 和 action
  // 注意：这里的 action.type 是字符串，需要通过 actionsFn[action.type] 来获取对应的函数
  return {
    ...state,
    ...actionsFn?.[action.type]?.(action.data, state, action),
  };
};

// CommonJS 导出
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initialState,
    rootReducer,
  }; // 适用于 require()
}

// ES6 导出
if (typeof exports !== "undefined") {
  exports.default = {
    initialState,
    rootReducer,
  }; // 适用于 import
}
